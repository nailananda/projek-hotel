"use client";

import Image from "next/image";
import { useState } from "react";

export default function FacilityImage({ facility, sizes, eager = false }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={facility.altText}
        className="absolute inset-0 flex items-center justify-center bg-[#D8C1A7] px-6 text-center font-serif text-lg text-[#62462F]"
      >
        {facility.nama}
      </div>
    );
  }

  return (
    <Image
      src={facility.gambar}
      alt={facility.altText}
      fill
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      className="object-cover"
      onError={() => setHasError(true)}
    />
  );
}
