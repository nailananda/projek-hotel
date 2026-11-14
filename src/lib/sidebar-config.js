export const SIDEBAR_GROUPS = [
  {
    label: "Admin",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: "dashboard",
        allowedRoles: ["ADMIN"],
      },
      {
        label: "Pengguna",
        href: "/admin/pengguna",
        icon: "users",
        allowedRoles: ["ADMIN"],
      },
      {
        label: "Laporan Okupansi",
        href: "/admin/laporan-okupansi",
        icon: "chart",
        allowedRoles: ["ADMIN"],
      },
      {
        label: "Laporan Transaksi",
        href: "/admin/laporan-transaksi",
        icon: "receipt",
        allowedRoles: ["ADMIN"],
      },
    ],
  },
  {
    label: "Resepsionis",
    items: [
      {
        label: "Operasional Resepsionis",
        href: "/resepsionis",
        icon: "desk",
        allowedRoles: ["RESEPSIONIS"],
      },
    ],
  },
  {
    label: "Housekeeping",
    items: [
      {
        label: "Operasional Housekeeping",
        href: "/housekeeping",
        icon: "bed",
        allowedRoles: ["HOUSEKEEPING"],
      },
    ],
  },
];

export const WEBSITE_LINK = {
  label: "Ke Website",
  href: "/",
  icon: "website",
};
