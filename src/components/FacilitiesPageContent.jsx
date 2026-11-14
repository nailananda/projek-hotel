"use client";

import { facilities } from "@/data/facilities";
import FacilityImage from "@/components/FacilityImage";
import { useEffect } from "react";

export default function FacilitiesPageContent() {
  useEffect(() => {
    const targetId = window.location.hash.slice(1);
    if (!targetId) return undefined;

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ block: "start" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <section
      id="daftar-fasilitas"
      aria-labelledby="facilities-heading"
      className="mx-auto max-w-7xl px-5 pb-10 pt-8 md:px-10 md:pb-16 md:pt-12"
    >
      <header className="mx-auto mb-10 max-w-2xl text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#795638]">
          Kenyamanan untuk Anda
        </p>
        <h1
          id="facilities-heading"
          className="mt-3 font-serif text-3xl text-[#4B3020] md:text-4xl"
        >
          Fasilitas NARA HOTEL
        </h1>
        <p className="mt-3 font-serif text-sm leading-6 text-[#72583F] md:text-base">
          Temukan beragam layanan yang dirancang untuk melengkapi pengalaman
          menginap Anda.
        </p>
      </header>

      <div className="space-y-7 md:space-y-10">
        {facilities.map((facility, index) => {
          const imageOnRight = index % 2 === 1;

          return (
            <article
              key={facility.id}
              id={facility.id}
              tabIndex={-1}
              className="facility-card grid items-center gap-6 rounded-2xl border border-[#E7CFB5] bg-[#FFF9F0]/80 p-4 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A16E43] md:grid-cols-2 md:gap-10 md:p-7"
            >
              <div
                className={`relative h-60 overflow-hidden rounded-xl bg-[#D8C1A7] sm:h-72 ${
                  imageOnRight ? "md:order-2" : ""
                }`}
              >
                <FacilityImage
                  facility={facility}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className={imageOnRight ? "md:order-1" : ""}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9A704D]">
                  Fasilitas {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-2 font-serif text-2xl text-[#4B3020] md:text-3xl">
                  {facility.nama}
                </h2>
                <p className="mt-4 font-serif text-sm leading-7 text-[#72583F] md:text-base">
                  {facility.deskripsiLengkap}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
