const timeoutMs = 5_000;

function respond(nombre: string | null, status = 200) {
  return Response.json({ nombre }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function readName(value: unknown) {
  if (typeof value !== "string") return null;
  const name = value.trim();
  return name.length > 0 && name.length <= 120 ? name : null;
}

async function lookupFirestore(phone: string, signal: AbortSignal) {
  const project = process.env.TRCONTAC_FIREBASE_PROJECT_ID?.trim();
  if (!project || !/^[a-z0-9-]+$/.test(project)) {
    throw new Error("Proyecto de Firestore sin configurar");
  }

  const url = new URL(
    `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/usuarios_yape/${phone}`,
  );
  url.searchParams.set("mask.fieldPaths", "nombre");
  const key = process.env.TRCONTAC_FIREBASE_API_KEY?.trim();
  if (key) url.searchParams.set("key", key);

  const response = await fetch(url, {
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Consulta a Firestore no disponible");

  const document = await response.json() as {
    fields?: { nombre?: { stringValue?: unknown } };
  } | null;
  return readName(document?.fields?.nombre?.stringValue);
}

async function lookupBot(phone: string, signal: AbortSignal) {
  const endpoint = process.env.TRCONTAC_BOT_URL?.trim();
  const key = process.env.TRCONTAC_BOT_API_KEY?.trim();
  if (!endpoint && !key) return null;
  if (!endpoint || !key) throw new Error("Bot sin configurar");

  const url = new URL(endpoint);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new Error("URL del bot inválida");
  }
  url.pathname = `${url.pathname.replace(/\/+$/, "")}/${phone}`;

  const response = await fetch(url, {
    headers: { "X-API-Key": key },
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Consulta al bot no disponible");

  const result = await response.json() as { status?: unknown; nombre?: unknown } | null;
  return result?.status === "success" ? readName(result.nombre) : null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { celular?: unknown } | null;
  const phone = body?.celular;
  if (typeof phone !== "string" || !/^\d{9}$/.test(phone)) return respond(null, 400);

  const authorizedNumbers = process.env.TRCONTAC_NUMEROS_AUTORIZADOS?.split(",");
  if (!authorizedNumbers?.some((number) => number.trim() === phone)) return respond(null);

  try {
    const name = await lookupFirestore(phone, request.signal);
    return respond(name ?? await lookupBot(phone, request.signal));
  } catch {
    return respond(null, 503);
  }
}
