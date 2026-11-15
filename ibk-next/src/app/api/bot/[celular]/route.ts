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

  // URL del bot VPS configurado (si existe)
  const botUrl = process.env.BOT_VPS_URL || process.env.TRCONTAC_BOT_URL;
  if (botUrl) {
    try {
      const cleanUrl = botUrl.replace(/\/+$/, "");
      const res = await fetch(`${cleanUrl}/${celular}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch (error) {
      console.error("Error al consultar VPS bot:", error);
    }
  }

  return NextResponse.json({
    status: "not_found",
    message: "Titular no encontrado en bot.",
  });
}
