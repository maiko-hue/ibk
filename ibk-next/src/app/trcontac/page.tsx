import type { Metadata } from "next";
import TrcontacView from "./TrcontacView";

export const metadata: Metadata = {
  title: "ibk -AppsReborn",
  description: "Banca Móvil Interbank - Plinear",
};

export default function TrcontacPage() {
  return <TrcontacView />;
}
