import ProtectedAreaShell from "@/components/ProtectedAreaShell";

export default function AdminLayout({ children }) {
  return (
    <ProtectedAreaShell areaPath="/admin">{children}</ProtectedAreaShell>
  );
}
