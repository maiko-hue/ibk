import type { Metadata } from "next";
import TransFlow from "./TransFlow";

export const metadata: Metadata = {
  title: "ibk -AppsReborn",
  description: "Banca Móvil Interbank - Transferencias",
};

export default function TransPage() {
  return <TransFlow />;
}
