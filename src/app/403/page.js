import Link from "next/link";
import { Suspense } from "react";
import {
  getCurrentUser,
  getHomePathForRole,
  ROLES,
} from "@/lib/rbac";

async function ForbiddenContent() {
  const user = await getCurrentUser();
  const destination =
    user && ROLES.includes(user.role) ? getHomePathForRole(user.role) : "/";
  const destinationLabel = destination === "/" ? "Kembali ke Beranda" : "Dashboard";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7E9D8] px-5 py-12 text-[#4B3020]">
      <section className="w-full max-w-xl rounded-3xl border border-[#E7CFB5] bg-[#FFF9F0] p-8 text-center shadow-xl md:p-12">
        <p className="font-serif text-sm uppercase tracking-[0.3em] text-[#9A704D]">
          NARA HOTEL
        </p>
        <p className="mt-7 font-serif text-6xl text-[#805735]">403</p>
        <h1 className="mt-3 font-serif text-2xl md:text-3xl">
          Akses tidak diizinkan
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#72583F]">
          Akun Anda tidak memiliki izin untuk membuka halaman tersebut.
        </p>
        <Link
          href={destination}
          className="mt-8 inline-flex rounded-full bg-[#70492D] px-7 py-3 font-semibold text-white transition-colors hover:bg-[#4B3020]"
        >
          {destinationLabel}
        </Link>
      </section>
    </main>
  );
}

export default function ForbiddenPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#F7E9D8] text-[#4B3020]">
          Memuat...
        </main>
      }
    >
      <ForbiddenContent />
    </Suspense>
  );
}
