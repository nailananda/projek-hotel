"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SIDEBAR_GROUPS, WEBSITE_LINK } from "@/lib/sidebar-config";
import SidebarIcon from "@/components/SidebarIcons";

const ROLE_LABELS = {
  TAMU: "Tamu",
  RESEPSIONIS: "Resepsionis",
  HOUSEKEEPING: "Housekeeping",
  ADMIN: "Admin",
};

function isAllowed(userRole, allowedRoles) {
  return userRole === "ADMIN" || allowedRoles.includes(userRole);
}

export default function Sidebar({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") setMobileOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal keluar dari akun.");
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      window.alert(error.message || "Terjadi kesalahan saat keluar.");
    } finally {
      setLoggingOut(false);
    }
  }

  const groups = SIDEBAR_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      isAllowed(user.role, item.allowedRoles)
    ),
  })).filter((group) => group.items.length > 0);

  function renderLink(item, isWebsite = false) {
    const active = !isWebsite && pathname === item.href;

    return (
      <Link
        key={item.href}
        href={item.href}
        title={collapsed ? item.label : undefined}
        aria-current={active ? "page" : undefined}
        onClick={() => setMobileOpen(false)}
        className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors ${
          active
            ? "bg-[#F1DFC9] font-semibold text-[#4B3020]"
            : "text-[#F6EBDD] hover:bg-white/10 hover:text-white"
        } ${collapsed ? "md:justify-center md:px-0" : ""}`}
      >
        <SidebarIcon name={item.icon} className="h-5 w-5 shrink-0" />
        <span className={collapsed ? "md:hidden" : ""}>{item.label}</span>
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        aria-label={mobileOpen ? "Tutup navigasi" : "Buka navigasi"}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((open) => !open)}
        className="fixed left-4 top-4 z-60 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#4B3020] text-[#FFF8EE] shadow-lg md:hidden"
      >
        <SidebarIcon name={mobileOpen ? "close" : "menu"} />
      </button>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Tutup navigasi"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      <aside
        aria-label="Sidebar area staf"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 -translate-x-full flex-col border-r border-white/10 bg-[#3D281C] text-white shadow-2xl transition-[transform,width] duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0 md:shadow-none ${
          collapsed ? "md:w-19" : "md:w-72"
        } ${mobileOpen ? "translate-x-0" : ""}`}
      >
        <div
          className={`flex h-19 shrink-0 items-center border-b border-white/10 px-5 ${
            collapsed ? "md:justify-center md:px-2" : "justify-between"
          }`}
        >
          <Link
            href="/"
            className={`font-serif text-lg tracking-[0.16em] text-[#F5D7B3] ${
              collapsed ? "md:hidden" : ""
            }`}
            onClick={() => setMobileOpen(false)}
          >
            NARA HOTEL
          </Link>
          {collapsed && (
            <span className="hidden font-serif text-lg text-[#F5D7B3] md:block">
              N
            </span>
          )}
          <button
            type="button"
            aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((value) => !value)}
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-[#E8D5C0] hover:bg-white/10 md:flex"
          >
            <SidebarIcon name={collapsed ? "expand" : "collapse"} />
          </button>
        </div>

        <nav
          aria-label="Navigasi area staf"
          className="flex-1 space-y-6 overflow-y-auto px-3 py-5"
        >
          {groups.map((group) => (
            <section key={group.label}>
              <h2
                className={`mb-2 px-3 font-serif text-xs uppercase tracking-[0.18em] text-[#CBB49B] ${
                  collapsed ? "md:hidden" : ""
                }`}
              >
                {group.label}
              </h2>
              <div className="space-y-1">
                {group.items.map((item) => renderLink(item))}
              </div>
            </section>
          ))}
        </nav>

        <div className="shrink-0 space-y-3 border-t border-white/10 p-3">
          {renderLink(WEBSITE_LINK, true)}
          <div
            className={`flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3 ${
              collapsed ? "md:justify-center md:px-0" : ""
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#8B6546] font-serif text-sm text-white">
              {user.name?.trim().charAt(0).toUpperCase() || "U"}
            </span>
            <div className={`min-w-0 flex-1 ${collapsed ? "md:hidden" : ""}`}>
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="mt-0.5 text-xs text-[#D8C2AA]">
                {ROLE_LABELS[user.role] || user.role}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            title={collapsed ? "Keluar" : undefined}
            className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm text-[#F3D1B3] hover:bg-white/10 disabled:opacity-60 ${
              collapsed ? "md:justify-center md:px-0" : ""
            }`}
          >
            <SidebarIcon name="logout" className="h-5 w-5 shrink-0" />
            <span className={collapsed ? "md:hidden" : ""}>
              {loggingOut ? "Keluar..." : "Keluar"}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
