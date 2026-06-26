import { requireAdmin } from "@/lib/admin/auth";
import AdminTopbar from "@/components/admin/AdminTopbar";
import CategoriesClient from "./CategoriesClient";

export default async function CategoriesPage() {
  const admin = await requireAdmin();
  return (
    <>
      <AdminTopbar title="Categorias" admin={admin} />
      <main style={{ padding: 24, maxWidth: 900 }}>
        <CategoriesClient />
      </main>
    </>
  );
}
