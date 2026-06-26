import { requireAdmin } from "@/lib/admin/auth";
import AdminTopbar from "@/components/admin/AdminTopbar";
import ReferralsClient from "./ReferralsClient";

export default async function ReferralsPage() {
  const admin = await requireAdmin();
  return (
    <>
      <AdminTopbar title="Indicações" admin={admin} />
      <main style={{ padding: 24 }}>
        <ReferralsClient />
      </main>
    </>
  );
}
