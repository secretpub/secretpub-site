import { requireAdmin } from "@/lib/admin/guard";
import { getContent } from "@/lib/content/store";
import ContentEditor from "@/components/admin/ContentEditor";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  await requireAdmin();
  const content = await getContent();
  return <ContentEditor initial={content} />;
}
