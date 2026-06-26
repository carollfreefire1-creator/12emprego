import { requireAdmin } from "@/lib/admin/auth";
import AdminTopbar from "@/components/admin/AdminTopbar";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const admin = await requireAdmin();
  return (
    <>
      <AdminTopbar title="Configurações" admin={admin} />
      <main style={{ padding: 24, maxWidth: 1000 }}>
        <SettingsClient />
      </main>
    </>
  );
}
