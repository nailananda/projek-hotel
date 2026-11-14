import ProtectedAreaShell from "@/components/ProtectedAreaShell";

export default function ResepsionisLayout({ children }) {
  return (
    <ProtectedAreaShell areaPath="/resepsionis">
      {children}
    </ProtectedAreaShell>
  );
}
