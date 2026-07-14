import { requireAdmin } from "@/lib/admin/guard";
import { getRawContent } from "@/lib/content/store";
import ContentEditor from "@/components/admin/ContentEditor";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  await requireAdmin();
  // URLs d'origine (non transformées) pour ne pas les figer dans la base au save.
  const content = await getRawContent();
  return <ContentEditor initial={content} />;
}
