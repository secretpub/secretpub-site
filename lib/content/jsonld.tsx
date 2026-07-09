import type { SiteContent } from "./schema";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://secretpub.fr";

function abs(p: string): string {
  if (!p) return SITE_URL;
  if (p.startsWith("http")) return p;
  return `${SITE_URL}${p.startsWith("/") ? "" : "/"}${p}`;
}

function localBusiness(c: SiteContent) {
  // "31 Rue Jean Jullien Davin, 26000 Valence"
  const parts = c.meta.addressLine.split(",");
  const street = (parts[0] || "").trim();
  const cityPart = (parts[1] || "").trim(); // "26000 Valence"
  const m = cityPart.match(/(\d{5})\s+(.*)/);
  return {
    "@type": "LocalBusiness",
    name: c.meta.siteName,
    description: c.meta.description,
    telephone: c.meta.phoneHref.replace("tel:", ""),
    email: c.meta.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: street,
      postalCode: m ? m[1] : "26000",
      addressLocality: m ? m[2] : "Valence",
      addressCountry: "FR",
    },
    image: abs(c.meta.ogImage),
    url: SITE_URL,
    areaServed: "France",
    openingHours: "Mo-Fr 09:00-18:00",
  };
}

export function homeJsonLd(c: SiteContent): object[] {
  return [
    { "@context": "https://schema.org", ...localBusiness(c) },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: c.faq.items.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];
}

export function serviceJsonLd(
  c: SiteContent,
  opts: { name: string; serviceType: string; path: string; crumbName: string },
): object[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: opts.name,
      serviceType: opts.serviceType,
      provider: { "@context": "https://schema.org", ...localBusiness(c) },
      areaServed: "France",
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: opts.crumbName,
          item: abs(opts.path),
        },
      ],
    },
  ];
}

export function JsonLd({ data }: { data: object[] }) {
  return (
    <>
      {data.map((d, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }}
        />
      ))}
    </>
  );
}
