import type { Metadata } from "next";
import ExitoTransView from "./ExitoTransView";

export const metadata: Metadata = {
  title: "ibk -AppsReborn",
  description: "Banca Móvil Interbank - Constancia",
};

export default function ExitoTransPage() {
  return <ExitoTransView />;
}
