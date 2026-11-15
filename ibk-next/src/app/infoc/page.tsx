import { Suspense } from "react";
import InfocView from "./InfocView";

export default function InfocPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#00B14F] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <InfocView />
    </Suspense>
  );
}
