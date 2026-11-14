"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NotificationButton from "@/components/NotificationButton";

const navigationItems = [
  { id: "beranda", label: "Beranda" },
  { id: "tentang", label: "Tentang Kami" },
  { id: "kamar", label: "Kamar" },
  { id: "fasilitas", label: "Fasilitas" },
  { id: "kontak", label: "Kontak" },
];

export default function SiteNavigation({
  activeSection = "beranda",
  onActiveSectionChange,
  isFacilityPage = false,
  user: externalUser,
  loadingUser: externalLoadingUser,
  loggingOut: externalLoggingOut,
  onLogout,
}) {
  const router = useRouter();
  const [pageUser, setPageUser] = useState(null);
  const [pageLoadingUser, setPageLoadingUser] = useState(true);
  const [pageLoggingOut, setPageLoggingOut] = useState(false);

  useEffect(() => {
    if (typeof externalUser !== "undefined") return undefined;

    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    async function fetchUser() {
      try {
        const response = await fetch("/api/me", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal,
        });
        const result = await response.json();

        if (active) {
          setPageUser(
            response.ok && result.success && result.data ? result.data : null
          );
        }
      } catch (error) {
        if (active) {
          console.error("Gagal memeriksa sesi login:", error);
          setPageUser(null);
        }
      } finally {
        clearTimeout(timeout);
        if (active) setPageLoadingUser(false);
      }
    }

    fetchUser();

    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [externalUser]);

  async function handleLogout() {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin keluar dari akun?"
    );
    if (!confirmed) return;

    setPageLoggingOut(true);

    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        window.alert(result.message || "Gagal keluar dari akun.");
        return;
      }

      setPageUser(null);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      window.alert("Terjadi kesalahan saat keluar. Silakan coba lagi.");
    } finally {
      setPageLoggingOut(false);
    }
  }

  const user =
    typeof externalUser === "undefined" ? pageUser : externalUser;
  const loadingUser =
    typeof externalLoadingUser === "undefined"
      ? pageLoadingUser
      : externalLoadingUser;
  const loggingOut =
    typeof externalLoggingOut === "undefined"
      ? pageLoggingOut
      : externalLoggingOut;
  const homePrefix = isFacilityPage ? "/" : "";

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-white/20 bg-[#3D281C]/90 text-white shadow-lg backdrop-blur-md">
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-10"
      >
        <a
          href={`${homePrefix}#beranda`}
          className="flex shrink-0 items-center gap-3"
        >
          <Image
            src="/nara-icon-light.svg"
            alt="Logo NARA HOTEL"
            width={41}
            height={48}
            priority
            unoptimized
            className="h-12 w-auto"
          />

          <div>
            <h1 className="font-serif text-lg tracking-widest md:text-xl">
              NARA HOTEL
            </h1>
            <p className="text-[9px] tracking-wide text-[#F5DEC4]">
              Stay Better, Feel at Home
            </p>
          </div>
        </a>

        <div className="hidden items-center gap-7 text-sm md:flex">
          {navigationItems.map(({ id, label }) => (
            <a
              key={id}
              href={`${homePrefix}#${id}`}
              onClick={() => onActiveSectionChange?.(id)}
              aria-current={activeSection === id ? "location" : undefined}
              className={`rounded px-1 py-2 transition-colors hover:text-[#E9C69D] ${
                activeSection === id
                  ? "border-b border-[#F5D7B3] text-[#F5D7B3]"
                  : "text-white"
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {loadingUser ? (
            <span className="text-xs text-white">Memuat...</span>
          ) : user ? (
            <>
              <span className="hidden text-sm text-white sm:inline">
                Halo, {user.name}
              </span>
              <button
                type="button"
                onClick={() => router.push("/reservasi")}
                className="rounded-full border border-[#E9C69D] bg-[#6B452D]/80 px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4B3020]"
              >
                Reservasi
              </button>
              <NotificationButton />
              <button
                type="button"
                onClick={onLogout || handleLogout}
                disabled={loggingOut}
                className="rounded-full border border-white/50 px-4 py-2.5 text-xs text-white hover:bg-white/15 disabled:opacity-50"
              >
                {loggingOut ? "Keluar..." : "Keluar"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="rounded-full border border-[#E9C69D] bg-[#57371F]/80 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-[#3D281C]"
            >
              Masuk
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
