import { requireAdmin } from "@/lib/admin/guard";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function CmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { email } = await requireAdmin();
  return (
    <>
      <AdminNav email={email} />
      {children}
    </>
  );
}
