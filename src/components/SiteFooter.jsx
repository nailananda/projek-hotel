import Link from "next/link";

const footerLinks = [
  { href: "#beranda", label: "Beranda" },
  { href: "#tentang", label: "Tentang Kami" },
  { href: "#kamar", label: "Pilihan Kamar" },
  { href: "#fasilitas", label: "Fasilitas" },
];

export default function SiteFooter({ isFacilityPage = false }) {
  const homePrefix = isFacilityPage ? "/" : "";

  return (
    <footer
      id="kontak"
      className="bg-[#3D281C] px-6 pb-6 pt-12 text-[#FFF4E7] md:px-10"
    >
      <div className="mx-auto grid max-w-7xl gap-10 border-b border-white/15 pb-9 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <h2 className="font-serif text-2xl tracking-[0.12em]">NARA HOTEL</h2>
          <p className="mt-4 max-w-sm text-sm leading-7 text-[#E1CBB3]">
            Menghadirkan kenyamanan, kehangatan, dan pengalaman menginap yang
            berkesan untuk setiap perjalanan.
          </p>
        </div>

        <div>
          <h3 className="font-serif text-lg">Navigasi</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[#E1CBB3]">
            {footerLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={`${homePrefix}${href}`}
                className="hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-serif text-lg">Reservasi</h3>
          <p className="mt-4 text-sm leading-7 text-[#E1CBB3]">
            Ingin merencanakan pengalaman menginap bersama NARA HOTEL?
          </p>
          <Link
            href="/reservasi"
            className="mt-4 inline-flex rounded-full bg-[#D8B58C] px-5 py-3 text-xs font-semibold text-[#3D281C] hover:bg-[#F0D7B8]"
          >
            Reservasi Sekarang
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl pt-6 text-center text-xs text-[#D7C4AF]">
        © 2026 NARA HOTEL. All rights reserved.
      </div>
    </footer>
  );
}
