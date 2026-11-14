"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import FacilityImage from "@/components/FacilityImage";
import { facilities } from "@/data/facilities";

export default function FacilitiesExperience() {
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const triggerRef = useRef(null);
  const closeButtonRef = useRef(null);
  const dialogRef = useRef(null);
  const closeTimerRef = useRef(null);
  const closeHandlerRef = useRef(() => undefined);

  function openModal(facility, trigger) {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    triggerRef.current = trigger;
    setSelectedFacility(facility);
    setModalVisible(true);
  }

  const closeModal = useCallback(() => {
    if (!selectedFacility || !modalVisible) return;

    setModalVisible(false);
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : 200;

    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setSelectedFacility(null);
    }, delay);
  }, [modalVisible, selectedFacility]);

  useEffect(() => {
    closeHandlerRef.current = closeModal;
  }, [closeModal]);

  useEffect(() => {
    if (!selectedFacility) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeHandlerRef.current();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusableElements.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const focusIsOutside = !dialogRef.current.contains(document.activeElement);

      if (
        event.shiftKey &&
        (document.activeElement === firstElement || focusIsOutside)
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === lastElement || focusIsOutside)
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [selectedFacility]);

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    },
    []
  );

  return (
    <>
      <section
        id="fasilitas"
        className="bg-[#F7E9D8] px-5 py-3 md:px-10 md:py-5"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-2xl bg-linear-to-r from-[#57371F] via-[#70492D] to-[#56351F] px-6 py-7 text-[#FFF4E7] shadow-lg md:flex-row md:items-center md:justify-between md:px-8">
          <div className="border-b border-white/40 pb-5 md:w-[27%] md:border-b-0 md:border-r md:pb-0">
            <h2 className="font-serif text-2xl">Fasilitas Unggulan</h2>
            <p className="mt-2 max-w-xs font-serif text-xs leading-5 text-[#F0DDC7]">
              Nikmati berbagai fasilitas terbaik untuk menunjang kenyamanan Anda.
            </p>
          </div>

          <div className="flex flex-1 gap-3 overflow-x-auto pb-2 sm:flex-wrap sm:justify-center md:grid md:grid-cols-5 md:gap-2">
            {facilities.map((facility) => {
              const isActive = selectedFacility?.id === facility.id;

              return (
                <button
                  key={facility.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={(event) =>
                    openModal(facility, event.currentTarget)
                  }
                  className={`min-h-12 shrink-0 rounded-lg border px-4 py-3 font-serif text-xs text-[#FFF4E7] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F5D7B3] ${
                    isActive
                      ? "border-[#F5D7B3] bg-white/20"
                      : "border-transparent hover:border-white/40 hover:bg-white/10"
                  }`}
                >
                  {facility.nama}
                </button>
              );
            })}
          </div>

          <Link
            href="/fasilitas"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#F5D7B3] px-5 py-3 font-serif text-xs font-semibold text-[#50331F] hover:bg-[#FFE7CC]"
          >
            Selengkapnya
          </Link>
        </div>
      </section>

      {selectedFacility &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className={`fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-black/60 p-4 transition-opacity duration-200 motion-reduce:duration-0 ${
              modalVisible ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            onClick={(event) => {
              if (event.target === event.currentTarget) closeModal();
            }}
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="facility-dialog-title"
              aria-describedby="facility-dialog-description"
              tabIndex={-1}
              className={`max-h-[calc(100dvh-2rem)] w-full max-w-xl transform overflow-x-hidden overflow-y-auto rounded-2xl bg-[#FFF8EE] text-[#4B3020] shadow-2xl transition duration-200 motion-reduce:duration-0 ${
                modalVisible
                  ? "scale-100 opacity-100"
                  : "scale-95 opacity-0"
              }`}
            >
              <div className="relative h-52 bg-[#D8C1A7] sm:h-64">
                <FacilityImage
                  key={selectedFacility.id}
                  facility={selectedFacility}
                  sizes="(max-width: 640px) 90vw, 560px"
                  eager
                />
                <button
                  ref={closeButtonRef}
                  type="button"
                  aria-label="Tutup detail fasilitas"
                  onClick={closeModal}
                  className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#3D281C]/80 text-2xl leading-none text-white hover:bg-[#3D281C]"
                >
                  ×
                </button>
              </div>
              <div className="p-6 sm:p-8">
                <h2
                  id="facility-dialog-title"
                  className="font-serif text-2xl text-[#4B3020] sm:text-3xl"
                >
                  {selectedFacility.nama}
                </h2>
                <p
                  id="facility-dialog-description"
                  className="mt-3 font-serif text-sm leading-7 text-[#72583F]"
                >
                  {selectedFacility.deskripsiSingkat}
                </p>
                <Link
                  href={`/fasilitas#${selectedFacility.id}`}
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-[#70492D] px-6 py-3 font-serif text-sm font-semibold text-white hover:bg-[#4B3020]"
                >
                  Lihat selengkapnya
                </Link>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
