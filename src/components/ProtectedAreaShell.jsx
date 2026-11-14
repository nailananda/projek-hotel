import { redirect } from "next/navigation";
import { Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import { canAccess, getCurrentUser } from "@/lib/rbac";

async function ProtectedAreaContent({ areaPath, children }) {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (!canAccess(areaPath, user.role)) redirect("/403");

  return (
    <div className="flex min-h-screen bg-[#F8F3EB] text-[#49372B]">
      <Sidebar user={user} />
      <div className="min-w-0 flex-1 px-4 pb-8 pt-20 md:px-8 md:py-8">
        {children}
      </div>
    </div>
  );
}

export default function ProtectedAreaShell({ areaPath, children }) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#F8F3EB] text-[#49372B]">
          <p>Memeriksa akses...</p>
        </main>
      }
    >
      <ProtectedAreaContent areaPath={areaPath}>
        {children}
      </ProtectedAreaContent>
    </Suspense>
  );
}
