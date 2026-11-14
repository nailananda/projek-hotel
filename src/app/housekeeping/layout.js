import ProtectedAreaShell from "@/components/ProtectedAreaShell";

export default function HousekeepingLayout({ children }) {
  return (
    <ProtectedAreaShell areaPath="/housekeeping">
      {children}
    </ProtectedAreaShell>
  );
}
