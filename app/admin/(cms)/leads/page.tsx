import { requireAdmin } from "@/lib/admin/guard";
import { getAdminSupabase } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Lead = {
  id: string;
  created_at: string;
  type: string;
  email: string;
  name: string | null;
  company: string | null;
  phone: string | null;
  needs: string[] | null;
  activity: string | null;
  sites: string | null;
  message: string | null;
  source_page: string | null;
};

export default async function LeadsPage() {
  await requireAdmin();
  const admin = getAdminSupabase();
  let leads: Lead[] = [];
  const configured = !!admin;
  if (admin) {
    const { data } = await admin
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    leads = (data as Lead[]) || [];
  }

  return (
    <main className="adm-main" style={{ maxWidth: 1180 }}>
      <h1 className="adm-h1">Demandes reçues</h1>
      <p className="adm-sub">
        Formulaires contact et liste d&apos;attente — {leads.length} au total.
      </p>
      {!configured && (
        <div className="adm-note">
          Supabase non configuré : les demandes ne sont pas encore enregistrées.
        </div>
      )}
      {configured && leads.length === 0 && (
        <div className="adm-empty">Aucune demande pour le moment.</div>
      )}
      {leads.length > 0 && (
        <table className="adm-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Nom</th>
              <th>Société</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Besoin</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id}>
                <td>{new Date(l.created_at).toLocaleString("fr-FR")}</td>
                <td>
                  <span className={"adm-badge " + l.type}>{l.type}</span>
                </td>
                <td>{l.name || "—"}</td>
                <td>{l.company || "—"}</td>
                <td>
                  <a href={"mailto:" + l.email}>{l.email}</a>
                </td>
                <td>{l.phone || "—"}</td>
                <td>
                  {Array.isArray(l.needs) ? l.needs.join(", ") : l.needs || "—"}
                </td>
                <td style={{ maxWidth: 300 }}>{l.message || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
