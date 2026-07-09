import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * On-demand revalidation. Called after a CMS save (admin server action does
 * this directly too) or from an external deploy hook. Requires the secret.
 */
export async function POST(req: NextRequest) {
  const secret =
    req.nextUrl.searchParams.get("secret") ||
    req.headers.get("x-revalidate-secret");
  if (
    !process.env.REVALIDATE_SECRET ||
    secret !== process.env.REVALIDATE_SECRET
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  revalidatePath("/");
  revalidatePath("/espace-de-commande");
  revalidatePath("/reseaux-franchises");
  return NextResponse.json({ ok: true, revalidated: true });
}
