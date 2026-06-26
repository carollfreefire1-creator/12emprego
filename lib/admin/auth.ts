import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findFirst({
    where: { email: user.email! },
    select: { id: true, name: true, email: true, avatarUrl: true, role: true },
  });

  if (!dbUser || dbUser.role !== "admin") redirect("/");

  return dbUser;
}
