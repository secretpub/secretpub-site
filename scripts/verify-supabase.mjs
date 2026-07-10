import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.log("MISSING env (URL or service_role key)");
  process.exit(1);
}
const s = createClient(url, key, { auth: { persistSession: false } });

// 1) site_content row
{
  const { data, error } = await s
    .from("site_content")
    .select("id,data")
    .eq("id", 1)
    .maybeSingle();
  console.log(
    "site_content :",
    error
      ? "❌ " + error.message
      : data
        ? `✅ ligne id=${data.id} (overrides: ${Object.keys(data.data || {}).length})`
        : "❌ ligne id=1 absente",
  );
}
// 2) leads table
{
  const { count, error } = await s
    .from("leads")
    .select("*", { count: "exact", head: true });
  console.log(
    "leads       :",
    error ? "❌ " + error.message : `✅ table OK (${count} demandes)`,
  );
}
// 3) write + read-back + reset
{
  const { error: e1 } = await s
    .from("site_content")
    .upsert({ id: 1, data: { _healthcheck: true } });
  const { data } = await s
    .from("site_content")
    .select("data")
    .eq("id", 1)
    .maybeSingle();
  const ok = data?.data?._healthcheck === true;
  await s.from("site_content").update({ data: {} }).eq("id", 1);
  console.log(
    "écriture CMS :",
    e1 ? "❌ " + e1.message : ok ? "✅ écriture + relecture OK (remis à zéro)" : "❌ relecture KO",
  );
}
// 4) storage bucket + upload/delete
{
  const { data: buckets, error } = await s.storage.listBuckets();
  const has = buckets?.some((b) => b.id === "site-content");
  console.log(
    "bucket images:",
    error ? "❌ " + error.message : has ? "✅ site-content (public)" : "❌ absent",
  );
  if (has) {
    const { error: eu } = await s.storage
      .from("site-content")
      .upload("uploads/_healthcheck.txt", new Uint8Array([111, 107]), {
        contentType: "text/plain",
        upsert: true,
      });
    await s.storage.from("site-content").remove(["uploads/_healthcheck.txt"]);
    console.log("upload image :", eu ? "❌ " + eu.message : "✅ upload + suppression OK");
  }
}
