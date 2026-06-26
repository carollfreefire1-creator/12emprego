import { requireAdmin } from "@/lib/admin/auth";
import AdminTopbar from "@/components/admin/AdminTopbar";
import PaymentsClient from "./PaymentsClient";

export default async function PaymentsPage() {
  const admin = await requireAdmin();
  return (
    <>
      <AdminTopbar title="Pagamentos" admin={admin} />
      <main style={{ padding: 24, maxWidth: 1280 }}>
        <PaymentsClient />
      </main>
    </>
  );
}
