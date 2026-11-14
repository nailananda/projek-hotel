
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import FacilitiesExperience from "@/components/FacilitiesExperience";
import SiteFooter from "@/components/SiteFooter";
import SiteNavigation from "@/components/SiteNavigation";

const roomImages = {
  "Standard Room":
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1000&q=85",
  "Deluxe Room":
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=85",
  "Suite Room":
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1000&q=85",
};

const heroSlides = [
  {
    src: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=2200&q=90",
    alt: "Kamar NARA HOTEL",
  },
  {
    src: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=2200&q=90",
    alt: "Kamar Deluxe NARA HOTEL",
  },
  {
    src: "https://images.unsplash.com/photo-1770306924605-4ba7075abe7a?auto=format&fit=crop&w=2200&q=85",
    alt: "Kolam renang NARA HOTEL",
  },
  {
    src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2200&q=85",
    alt: "Suasana interior NARA HOTEL",
  },
];

function formatRupiah(price) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
}

function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function Home() {
  const router = useRouter();

  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [roomError, setRoomError] = useState("");

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");
  const [today, setToday] = useState("");

  const [activeSlide, setActiveSlide] = useState(0);
  const [activeSection, setActiveSection] = useState("beranda");
  const [heroPaused, setHeroPaused] = useState(false);
  const touchStartX = useRef(null);

  useEffect(() => {
    const sectionIds = [
      "beranda",
      "kamar",
      "fasilitas",
      "tentang",
      "kontak",
    ];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    let animationFrame = 0;

    function updateActiveSection() {
      animationFrame = 0;
      let currentSection = sections[0];
      const activationLine = 200;

      for (const section of sections) {
        if (section.getBoundingClientRect().top <= activationLine) {
          currentSection = section;
        } else {
          break;
        }
      }

      if (currentSection) {
        setActiveSection(currentSection.id);
      }
    }

    function handleScroll() {
      if (animationFrame !== 0) return;
      animationFrame = window.requestAnimationFrame(updateActiveSection);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateActiveSection();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrame !== 0) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  // Geser otomatis tiap 5 detik.
  useEffect(() => {
    if (heroPaused) return;

    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [heroPaused, activeSlide]);

  function goToSlide(index) {
    setActiveSlide((index + heroSlides.length) % heroSlides.length);
  }

  function handleTouchStart(event) {
    touchStartX.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event) {
    if (touchStartX.current === null) return;

    const diff = touchStartX.current - event.changedTouches[0].clientX;
    touchStartX.current = null;

    if (Math.abs(diff) < 50) return;

    goToSlide(diff > 0 ? activeSlide + 1 : activeSlide - 1);
  }

  // Mengambil tanggal setelah halaman dimuat di browser.
  useEffect(() => {
    let active = true;

    async function loadToday() {
      await Promise.resolve();

      if (active) {
        setToday(getToday());
      }
    }

    loadToday();

    return () => {
      active = false;
    };
  }, []);

  // Mengambil data tipe kamar dari database.
  useEffect(() => {
    let active = true;

    async function fetchRooms() {
      try {
        const response = await fetch("/api/room-types", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success || !Array.isArray(result.data)) {
          throw new Error(
            result.message || "Gagal mengambil data kamar dari server."
          );
        }

        if (active) {
          setRooms(result.data);
        }
      } catch (error) {
        if (active) {
          setRoomError(error.message || "Gagal mengambil data kamar.");
        }
      } finally {
        if (active) {
          setLoadingRooms(false);
        }
      }
    }

    fetchRooms();

    return () => {
      active = false;
    };
  }, []);

  // Memeriksa sesi login dengan batas waktu 5 detik.
  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 5000);

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
          if (response.ok && result.success && result.data) {
            setUser(result.data);
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        if (active) {
          console.error("Gagal memeriksa sesi login:", error);
          setUser(null);
        }
      } finally {
        clearTimeout(timeout);

        if (active) {
          setLoadingUser(false);
        }
      }
    }

    fetchUser();

    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  // Logout.
  async function handleLogout() {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin keluar dari akun?"
    );

    if (!confirmed) return;

    setLoggingOut(true);

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

      setUser(null);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      window.alert("Terjadi kesalahan saat keluar. Silakan coba lagi.");
    } finally {
      setLoggingOut(false);
    }
  }

  // Validasi pencarian kamar.
  function handleSearch(event) {
    event.preventDefault();

    if (!checkIn || !checkOut) {
      window.alert("Silakan pilih tanggal check-in dan check-out.");
      return;
    }

    if (checkIn < today) {
      window.alert("Tanggal check-in tidak boleh sebelum hari ini.");
      return;
    }

    if (checkOut <= checkIn) {
      window.alert("Tanggal check-out harus setelah tanggal check-in.");
      return;
    }

    document.getElementById("kamar")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  // Membuat URL reservasi berdasarkan pilihan pengguna.
  function getReservationUrl(roomTypeId) {
    const params = new URLSearchParams({
      roomTypeId: String(roomTypeId),
      guests,
      checkIn,
      checkOut,
    });

    return `/reservasi?${params.toString()}`;
  }

  // Tombol pesan kamar.
  function handleBook(roomTypeId) {
    if (!user) {
      router.push("/login");
      return;
    }

    router.push(getReservationUrl(roomTypeId));
  }

  return (
    <main className="min-h-screen overflow-x-clip bg-[#F7E9D8] text-[#4B3020]">
      {/* HERO */}
      <section
        id="beranda"
        className="relative min-h-152.5 md:min-h-172.5"
        onMouseEnter={() => setHeroPaused(true)}
        onMouseLeave={() => setHeroPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* CAROUSEL BACKGROUND */}
        <div className="absolute inset-0 overflow-hidden bg-[#3D281C]">
          {heroSlides.map((slide, index) => (
            <Image
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              unoptimized
              sizes="100vw"
              aria-hidden={index !== activeSlide}
              className={`object-cover transition-opacity duration-1000 motion-reduce:transition-none ${
                index === activeSlide ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(48,29,17,0.76), rgba(48,29,17,0.35), rgba(48,29,17,0.12))",
            }}
          />
        </div>

        {/* KONTROL CAROUSEL */}
        <div className="absolute bottom-28 right-5 z-20 flex items-center gap-3 md:bottom-36 md:right-10">
          <button
            type="button"
            onClick={() => goToSlide(activeSlide - 1)}
            aria-label="Gambar sebelumnya"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-[#3D281C]/40 text-white backdrop-blur-sm hover:bg-[#3D281C]/70"
          >
            ‹
          </button>

          <div className="flex items-center gap-2">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => goToSlide(index)}
                aria-label={`Tampilkan gambar ${index + 1}`}
                className={`h-2 rounded-full transition-all ${
                  index === activeSlide
                    ? "w-6 bg-[#F5D7B3]"
                    : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => goToSlide(activeSlide + 1)}
            aria-label="Gambar berikutnya"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-[#3D281C]/40 text-white backdrop-blur-sm hover:bg-[#3D281C]/70"
          >
            ›
          </button>
        </div>

        <SiteNavigation
          activeSection={activeSection}
          onActiveSectionChange={setActiveSection}
          user={user}
          loadingUser={loadingUser}
          loggingOut={loggingOut}
          onLogout={handleLogout}
        />

        {/* HERO CONTENT */}
        <div className="relative z-10 mx-auto flex min-h-152.5 max-w-7xl items-center px-6 pb-24 pt-28 md:min-h-172.5 md:px-10">
          <div className="max-w-2xl text-[#FFF8EE]">
            <div className="mb-5 flex items-center gap-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#F0D0A9]">
                Welcome to NARA HOTEL
              </p>
              <span className="h-px w-16 bg-[#E8C69C]" />
            </div>

            <h2 className="font-serif text-4xl font-medium leading-[1.13] md:text-6xl">
              Temukan Kenyamanan untuk Setiap Perjalanan
            </h2>

            <p className="mt-5 max-w-lg font-serif text-sm leading-7 text-[#F7EBDD] md:text-base">
              Nikmati pengalaman menginap yang berkesan dengan pelayanan
              terbaik dan fasilitas lengkap di NARA HOTEL.
            </p>

            <a
              href="#kamar"
              className="mt-7 inline-flex items-center rounded-full bg-[#F5D7B3] px-7 py-3.5 font-serif text-sm font-semibold text-[#50331F] shadow-lg hover:-translate-y-1 hover:bg-[#FFE7CC]"
            >
              Jelajahi Hotel
            </a>
          </div>
        </div>


        {/* PEMISAH HERO */}
        <div className="pointer-events-none absolute -bottom-0.5 left-0 z-10 w-full overflow-hidden leading-none">
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            className="h-21.25 w-full md:h-27.5"
          >
            <path
              d="M0,65 C180,10 310,18 480,55 C680,100 810,100 1000,55 C1190,10 1320,25 1440,55 L1440,120 L0,120 Z"
              fill="#F7E9D8"
            />
          </svg>
        </div>
      </section>

      {/* PILIHAN KAMAR */}
      <section
        id="kamar"
        className="relative z-0 bg-[#F7E9D8] px-5 pb-16 pt-24 md:px-10 md:pb-20 md:pt-16"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="mb-2 flex items-center gap-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#755034]">
                  Tipe Kamar
                </p>
                <span className="h-px w-16 bg-[#B78A60]" />
              </div>

              <h2 className="font-serif text-3xl text-[#4B3020] md:text-4xl">
                Pilihan Kamar untuk Anda
              </h2>

              <p className="mt-2 max-w-lg font-serif text-sm text-[#72583F]">
                Nikmati kenyamanan maksimal dengan pilihan kamar premium yang
                elegan dan modern.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/reservasi")}
              className="inline-flex w-fit items-center rounded-full border border-[#805735] px-6 py-3 font-serif text-xs font-semibold text-[#57371F] hover:bg-[#EBD5BC]"
            >
              Lihat Semua Kamar
            </button>
          </div>

          {loadingRooms && (
            <div className="py-16 text-center text-[#76563B]">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#D8B995] border-t-[#6B452D]" />
              Memuat pilihan kamar...
            </div>
          )}

          {!loadingRooms && roomError && (
            <div className="rounded-xl border border-[#D8B995] bg-[#FFF9F0] p-6 text-center">
              <p className="font-semibold">
                Data kamar belum dapat ditampilkan.
              </p>
              <p className="mt-2 text-sm text-[#76604D]">{roomError}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 rounded-lg bg-[#6B452D] px-5 py-3 text-sm font-semibold text-white hover:bg-[#4B2E1C]"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {!loadingRooms && !roomError && rooms.length === 0 && (
            <div className="rounded-xl bg-[#FFF9F0] p-10 text-center text-[#76604D]">
              Belum ada tipe kamar yang tersedia.
            </div>
          )}

          {!loadingRooms && !roomError && rooms.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => {
                const availableRooms = (room.rooms || []).filter(
                  (item) => item.status === "TERSEDIA"
                );

                const roomFacilities = Array.isArray(room.facilities)
                  ? room.facilities
                  : [];

                const roomImage =
                  room.imageUrl ||
                  roomImages[room.name] ||
                  roomImages["Standard Room"];

                return (
                  <article
                    key={room.id}
                    className="group overflow-hidden rounded-xl border border-[#E7CFB5] bg-[#FFF4E7] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative h-51.25 overflow-hidden md:h-55">
                      <Image
                        src={roomImage}
                        alt={room.name}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                    </div>

                    <div className="p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-serif text-lg font-semibold text-[#4B3020]">
                          {room.name}
                        </h3>

                        <span className="rounded-full bg-[#F0D2AE] px-3 py-1 text-[10px] font-semibold text-[#654329]">
                          {formatRupiah(room.price)} / malam
                        </span>
                      </div>

                      <p className="mt-2 min-h-10 text-xs leading-5 text-[#765B43]">
                        {room.description ||
                          "Kenyamanan dan suasana hangat untuk menemani perjalanan Anda."}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {roomFacilities.length > 0 ? (
                          roomFacilities.map((facility, index) => (
                            <span
                              key={`${room.id}-facility-${index}`}
                              className="rounded-full border border-[#DCC2A5] bg-[#F7E9D8] px-3 py-1 text-[10px] text-[#684A31]"
                            >
                              {facility}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-[#947B63]">
                            Informasi fasilitas belum tersedia.
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-[#E8D5C0] pt-3">
                        <span className="text-[11px] text-[#80664D]">
                          {room.capacity} Tamu
                        </span>

                        <span
                          className={`text-[11px] font-semibold ${
                            availableRooms.length > 0
                              ? "text-[#557247]"
                              : "text-[#A34F37]"
                          }`}
                        >
                          {availableRooms.length > 0
                            ? `${availableRooms.length} kamar tersedia`
                            : "Kamar penuh"}
                        </span>
                      </div>

                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleBook(room.id)}
                          disabled={availableRooms.length === 0}
                          className="inline-flex items-center text-xs font-semibold text-[#68452B] hover:text-[#A16E43] disabled:cursor-not-allowed disabled:text-[#A99A8B]"
                        >
                          {availableRooms.length === 0
                            ? "Tidak tersedia"
                            : user
                              ? "Pesan Sekarang"
                              : "Masuk untuk Memesan"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <FacilitiesExperience />

      {/* TENTANG HOTEL */}
      <section
        id="tentang"
        className="relative overflow-hidden bg-[#F7E9D8] px-5 pb-20 pt-12 md:px-10 md:pb-28 md:pt-16"
      >
        <div className="pointer-events-none absolute right-0 top-10 h-80 w-80 rounded-full bg-[#E5C5A3]/30 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-2">
          <div className="relative">
            <div className="relative overflow-hidden rounded-tl-[150px] rounded-br-[100px] border-[5px] border-[#FFF2E2] shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85"
                alt="Suasana interior NARA HOTEL"
                width={1200}
                height={800}
                unoptimized
                className="h-82.5 w-full object-cover md:h-105"
              />
            </div>

            <div className="absolute -bottom-5 right-5 rounded-lg bg-[#70492D] px-6 py-4 text-[#FFF4E7] shadow-lg">
              <p className="font-serif text-xl">NARA HOTEL</p>
              <p className="mt-1 text-[9px] tracking-[0.2em]">
                STAY BETTER, FEEL AT HOME
              </p>
            </div>
          </div>

          <div className="relative z-10 md:pl-5">
            <div className="mb-3 flex items-center gap-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#795638]">
                Pengalaman Menginap
              </p>
              <span className="h-px w-16 bg-[#B78A60]" />
            </div>

            <h2 className="font-serif text-3xl leading-tight text-[#4B3020] md:text-4xl">
              Lebih dari Sekadar Menginap
            </h2>

            <p className="mt-4 max-w-lg font-serif text-sm leading-7 text-[#72583F]">
              Rasakan suasana elegan, pelayanan ramah, dan ketenangan yang
              akan membuat perjalanan Anda menjadi lebih istimewa bersama
              NARA HOTEL.
            </p>

            <button
              type="button"
              onClick={() => router.push("/reservasi")}
              className="mt-7 inline-flex items-center rounded-full border border-[#805735] bg-[#70492D] px-6 py-3 font-serif text-xs font-semibold text-white hover:bg-[#4B3020]"
            >
              Tentang Kami
            </button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
