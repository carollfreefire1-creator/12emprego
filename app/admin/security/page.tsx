import { requireAdmin } from "@/lib/admin/auth";
import AdminTopbar from "@/components/admin/AdminTopbar";
import SecurityClient from "./SecurityClient";

export default async function SecurityPage() {
  const admin = await requireAdmin();
  return (
    <>
      <AdminTopbar title="Segurança" admin={admin} />
      <main style={{ padding: 24 }}>
        <SecurityClient />
      </main>
    </>
  );
}
