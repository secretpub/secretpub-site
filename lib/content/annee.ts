import pilotage from "@/content/mots-cles-seo.json";

/**
 * Années dynamiques des textes SEO (articles « Conseils » et page /conseils).
 *
 * Dans content/conseils.json, on n'écrit pas l'année en dur mais un repère :
 *   {annee}           l'année en cours (2026, puis 2027 dès le 1er janvier 2027) ;
 *   {annee_suivante}  l'année en cours + 1 ;
 *   {annee_cible}     l'année que les clients préparent : l'année suivante à partir
 *                     de la date de bascule (content/mots-cles-seo.json,
 *                     reglages.basculeAnneeCible, « 11-01 » = 1er novembre),
 *                     sinon l'année en cours.
 *
 * Le remplacement se fait au rendu, à l'heure de Paris. Les pages /conseils sont
 * régénérées toutes les heures (revalidate = 3600) : l'année change toute seule,
 * sans republier le site ni réécrire les articles.
 */
export type Annees = {
  annee: number;
  annee_suivante: number;
  annee_cible: number;
};

export function anneesSeo(maintenant: Date = new Date()): Annees {
  const parts = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(maintenant);
  const lire = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  const annee = lire("year");
  const mois = lire("month");
  const jour = lire("day");
  const [moisBascule, jourBascule] = String(
    pilotage.reglages?.basculeAnneeCible || "11-01",
  )
    .split("-")
    .map(Number);
  const apresBascule =
    mois > moisBascule || (mois === moisBascule && jour >= jourBascule);
  return {
    annee,
    annee_suivante: annee + 1,
    annee_cible: apresBascule ? annee + 1 : annee,
  };
}

const REPERE = /\{(annee|annee_suivante|annee_cible)\}/g;

/** Remplace les repères d'année dans une chaîne, un tableau ou un objet (copie). */
export function remplacerAnnees<T>(valeur: T, a: Annees = anneesSeo()): T {
  if (typeof valeur === "string") {
    return valeur.replace(REPERE, (_, cle: keyof Annees) =>
      String(a[cle]),
    ) as T;
  }
  if (Array.isArray(valeur)) {
    return valeur.map((v) => remplacerAnnees(v, a)) as T;
  }
  if (valeur && typeof valeur === "object") {
    const copie: Record<string, unknown> = {};
    for (const [cle, v] of Object.entries(valeur)) {
      copie[cle] = remplacerAnnees(v, a);
    }
    return copie as T;
  }
  return valeur;
}
