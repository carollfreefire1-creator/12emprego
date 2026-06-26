import { requireAdmin } from "@/lib/admin/auth";
import AdminTopbar from "@/components/admin/AdminTopbar";
import CouponsClient from "./CouponsClient";

export default async function CouponsPage() {
  const admin = await requireAdmin();
  return (
    <>
      <AdminTopbar title="Cupons" admin={admin} />
      <main style={{ padding: 24 }}>
        <CouponsClient />
      </main>
    </>
  );
}
