import type { Metadata } from "next";
import TrcontacView from "./TrcontacView";

export const metadata: Metadata = {
  title: "Enviar a - Plin",
  description: "Banca Móvil Interbank - Plinear",
};

export default function TrcontacPage() {
  return <TrcontacView />;
}
