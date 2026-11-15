import type { Metadata } from "next";
import CotrasFlow from "./CotrasFlow";

export const metadata: Metadata = {
  title: "ibk -AppsReborn",
  description: "Banca Móvil Interbank - Transferencias a otras cuentas",
};

export default function CotrasPage() {
  return <CotrasFlow />;
}
