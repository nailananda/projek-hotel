import Link from "next/link";
import FacilitiesPageContent from "@/components/FacilitiesPageContent";
import SiteFooter from "@/components/SiteFooter";
import SiteNavigation from "@/components/SiteNavigation";

export const metadata = {
  title: "Fasilitas | NARA HOTEL",
  description:
    "Kenali fasilitas NARA HOTEL yang dirancang untuk melengkapi pengalaman menginap Anda.",
};

export default function FacilitiesPage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-[#F7E9D8] text-[#4B3020]">
      <div className="relative z-40">
        <SiteNavigation isFacilityPage activeSection="fasilitas" />
      </div>

      <div className="mx-auto max-w-7xl px-5 pt-28 md:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-[#805735] px-5 py-3 font-serif text-xs font-semibold text-[#57371F] hover:bg-[#EBD5BC]"
        >
          <span aria-hidden="true">←</span>
          Kembali ke Beranda
        </Link>
      </div>

      <FacilitiesPageContent />
      <SiteFooter isFacilityPage />
    </main>
  );
}
