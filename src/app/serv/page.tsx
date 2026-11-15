"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ServFlow from "./ServFlow";

function ServContent() {
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");
  const initialView = viewParam === "exito" ? "exito" : "form";

  return <ServFlow initialView={initialView} />;
}

export default function ServPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#00B14F] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ServContent />
    </Suspense>
  );
}
