import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { celular: string } }
) {
  const { celular } = params;

  if (!celular || !/^\d{9}$/.test(celular)) {
    return NextResponse.json(
      { status: "error", message: "Número de celular inválido." },
      { status: 400 }
    );
  }

  // URL del VPS bot original o por variable de entorno
  const vpsBaseUrl =
    process.env.BOT_VPS_URL ||
    process.env.TRCONTAC_BOT_URL ||
    "http://116.203.222.62:8000/buscar";

  const cleanUrl = vpsBaseUrl.replace(/\/+$/, "");
  const targetUrl = cleanUrl.endsWith("/buscar")
    ? `${cleanUrl}/${celular}`
    : `${cleanUrl}/buscar/${celular}`;

  const apiKey = process.env.BOT_API_KEY || "Maikol_Dev_2026_Secure";

  try {
    const res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
        "Cache-Control": "no-cache",
      },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    } else {
      const errText = await res.text().catch(() => "");
      return NextResponse.json(
        { status: "error", message: "Error al consultar el VPS", detalle: errText },
        { status: res.status }
      );
    }
  } catch (error: any) {
    console.error("Error al consultar VPS bot:", error);
    return NextResponse.json({
      status: "error",
      nombre: "Desconocido",
      detalle: error?.message || "Error al conectar con el VPS",
    });
  }
}
