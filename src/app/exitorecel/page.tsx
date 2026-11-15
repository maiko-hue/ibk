"use client";

import React, { Suspense } from "react";
import RecelFlow from "../recel/RecelFlow";

export default function ExitoRecelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#00B14F] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RecelFlow initialView="exito" />
    </Suspense>
  );
}
