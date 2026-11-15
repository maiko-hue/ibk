import type { Metadata } from "next";
import SobreView from "./SobreView";

export const metadata: Metadata = {
  title: "ibk -AppsReborn",
  description: "Banca Móvil Interbank - Información de App",
};

export default function SobrePage() {
  return <SobreView />;
}
