import { requireAdmin } from "@/lib/admin/auth";
import AdminTopbar from "@/components/admin/AdminTopbar";
import UsersClient from "./UsersClient";

export default async function UsersPage() {
  const admin = await requireAdmin();
  return (
    <>
      <AdminTopbar title="Usuários" admin={admin} />
      <main style={{ padding: 24, maxWidth: 1280 }}>
        <UsersClient />
      </main>
    </>
  );
}
