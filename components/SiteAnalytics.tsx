"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

/**
 * Analytics Vercel avec opt-out personnel.
 *
 * Pour ne PAS compter ses propres visites (tests, admin), il suffit d'ouvrir
 * le site une fois avec `?noanalytics` dans l'URL (ex : https://secretpub.fr/?noanalytics).
 * Un drapeau est alors mémorisé dans le navigateur (localStorage) et, à partir de
 * là, aucune page vue n'est envoyée depuis CE navigateur. À refaire sur chaque
 * appareil/navigateur perso. Pour réactiver le comptage : `?analytics`.
 */
const OPT_OUT_KEY = "sp-noanalytics";

export function SiteAnalytics() {
  return (
    <>
      <Analytics
        beforeSend={(event) => {
          if (typeof window === "undefined") return event;
          try {
            const url = new URL(event.url);
            if (url.searchParams.has("noanalytics")) {
              window.localStorage.setItem(OPT_OUT_KEY, "1");
            }
            if (url.searchParams.has("analytics")) {
              window.localStorage.removeItem(OPT_OUT_KEY);
            }
            if (window.localStorage.getItem(OPT_OUT_KEY) === "1") return null;
          } catch {
            // pas de localStorage (mode privé strict) : on laisse passer
          }
          return event;
        }}
      />
      <SpeedInsights />
    </>
  );
}
