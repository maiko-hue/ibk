"use client";

import React, { Suspense } from "react";
import ServFlow from "../serv/ServFlow";

export default function ExitoServPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#00B14F] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ServFlow initialView="exito" />
    </Suspense>
  );
}
