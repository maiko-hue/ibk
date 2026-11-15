import type { Metadata } from "next";
import ExitoCotrasView from "./ExitoCotrasView";

export const metadata: Metadata = {
  title: "ibk -AppsReborn",
  description: "Banca Móvil Interbank - Constancia de Transferencia",
};

export default function ExitoCotrasPage() {
  return <ExitoCotrasView />;
}
