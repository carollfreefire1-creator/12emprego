import { requireAdmin } from "@/lib/admin/auth";
import AdminTopbar from "@/components/admin/AdminTopbar";
import ProfessionalsClient from "./ProfessionalsClient";

export default async function ProfessionalsPage() {
  const admin = await requireAdmin();
  return (
    <>
      <AdminTopbar title="Profissionais" admin={admin} />
      <main style={{ padding: 24, maxWidth: 1280 }}>
        <ProfessionalsClient />
      </main>
    </>
  );
}
