import type { SiteContent } from "./schema";

/* eslint-disable @typescript-eslint/no-explicit-any */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://secretpub.fr";
const BIZ_ID = SITE_URL + "#business";

function abs(p: string): string {
  if (!p) return SITE_URL;
  if (p.startsWith("http")) return p;
  return `${SITE_URL}${p.startsWith("/") ? "" : "/"}${p}`;
}

function localBusiness(c: SiteContent) {
  const meta = c.meta as any;
  const parts = c.meta.addressLine.split(",");
  const street = (parts[0] || "").trim();
  const cityPart = (parts[1] || "").trim(); // "26000 Valence"
  const m = cityPart.match(/(\d{5})\s+(.*)/);
  const socials = (c.footer?.socials || [])
    .map((s: any) => s.href)
    .filter((h: string) => /^https?:/.test(h));

  const biz: any = {
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": BIZ_ID,
    name: c.meta.siteName,
    // Toutes les graphies rencontrées sur le web pointent vers la MÊME entité,
    // dont le nom canonique est « SecretPub » (name). Ça neutralise la confusion
    // Google « Secret Pub » (2 mots) vs « SecretPub » (le « Essayer avec… »).
    alternateName: [
      "Secret Pub",
      "Secret Pub Valence",
      "SecretPub Valence",
      "NOSTILE FACTORY",
    ],
    legalName: "NOSTILE FACTORY",
    slogan: "Toute votre communication physique, un seul partenaire.",
    foundingDate: "2015-05-21",
    knowsAbout: [
      "Enseigne",
      "Enseigne lumineuse",
      "Signalétique",
      "Impression grand format",
      "Imprimerie",
      "PLV",
      "Textile personnalisé",
      "Objets publicitaires",
      "Goodies",
      "Packaging",
      "Habillage de véhicule",
      "Covering",
      "Communication visuelle",
    ],
    vatID: "FR74811457142",
    identifier: {
      "@type": "PropertyValue",
      propertyID: "SIREN",
      value: "811457142",
    },
    description: c.meta.description,
    url: SITE_URL,
    telephone: c.meta.phoneHref.replace("tel:", ""),
    email: c.meta.email,
    image: abs(c.meta.ogImage),
    logo: {
      "@type": "ImageObject",
      url: abs("/assets/logo-full.png"),
      width: 1192,
      height: 253,
    },
    priceRange: meta.priceRange || "€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: street,
      postalCode: m ? m[1] : "26000",
      addressLocality: m ? m[2] : "Valence",
      addressCountry: "FR",
    },
    areaServed: [
      { "@type": "City", name: "Valence" },
      { "@type": "AdministrativeArea", name: "Drôme" },
      { "@type": "Country", name: "France" },
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
  };

  if (meta.geoLat && meta.geoLng) {
    biz.geo = {
      "@type": "GeoCoordinates",
      latitude: meta.geoLat,
      longitude: meta.geoLng,
    };
  }
  // sameAs = profils officiels + fiche Google (relie le site à l'entité "SecretPub"
  // connue de Google, ce qui consolide la marque et neutralise "Secret Pub").
  const sameAs = [...socials];
  if (meta.googleReviewUrl) sameAs.push(meta.googleReviewUrl);
  if (sameAs.length) biz.sameAs = sameAs;
  if (meta.googleReviewUrl) biz.hasMap = meta.googleReviewUrl;
  if (meta.ratingValue && meta.reviewCount) {
    biz.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: String(meta.ratingValue),
      reviewCount: Number(meta.reviewCount),
      bestRating: "5",
    };
  }
  const testimonials = c.realisations?.testimonials || [];
  if (testimonials.length) {
    biz.review = testimonials.slice(0, 5).map((t: any) => ({
      "@type": "Review",
      author: { "@type": "Person", name: t.name || "Client" },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody: t.quote,
    }));
  }
  // Catalogue de services (les pages métier) : dit clairement aux moteurs et
  // aux IA « voici ce que fait SecretPub », utile pour les réponses génératives.
  const metierOffers = Object.values((c as any).metierPages || {}).map(
    (p: any) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: p.navLabel,
        description: p.meta?.description,
        url: abs(`/${p.slug}`),
      },
    }),
  );
  if (metierOffers.length) {
    biz.hasOfferCatalog = {
      "@type": "OfferCatalog",
      name: "Communication physique — SecretPub",
      itemListElement: metierOffers,
    };
  }
  return biz;
}

export function homeJsonLd(c: SiteContent): object[] {
  return [
    { "@context": "https://schema.org", ...localBusiness(c) },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": SITE_URL + "#website",
      name: c.meta.siteName,
      alternateName: ["Secret Pub", "SecretPub Valence"],
      url: SITE_URL,
      inLanguage: "fr-FR",
      publisher: { "@id": BIZ_ID },
    },
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
      provider: { "@id": BIZ_ID },
      areaServed: [
        { "@type": "City", name: "Valence" },
        { "@type": "AdministrativeArea", name: "Drôme" },
        { "@type": "Country", name: "France" },
      ],
    },
    { "@context": "https://schema.org", ...localBusiness(c) },
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

export function metierJsonLd(c: SiteContent, page: any): object[] {
  const url = abs(`/${page.slug}`);
  // Pages villes : la zone desservie = la ville ciblée (signal SEO local).
  // Sinon (pages métier génériques) : Valence / Drôme / France.
  const areaServed = page.areaServed
    ? [
        { "@type": "City", name: page.areaServed },
        { "@type": "Country", name: "France" },
      ]
    : [
        { "@type": "City", name: "Valence" },
        { "@type": "AdministrativeArea", name: "Drôme" },
        { "@type": "Country", name: "France" },
      ];
  const offers = (page.prestations?.items || []).map((it: any) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: it.title,
      description: it.desc,
    },
  }));
  return [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: page.navLabel,
      serviceType: page.hero?.crumb || page.navLabel,
      description: page.meta?.description,
      url,
      provider: { "@id": BIZ_ID },
      areaServed,
      ...(offers.length
        ? {
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: page.prestations?.title || page.navLabel,
              itemListElement: offers,
            },
          }
        : {}),
    },
    { "@context": "https://schema.org", ...localBusiness(c) },
    ...(page.faq?.items?.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: page.faq.items.map((f: any) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]
      : []),
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: page.hero?.crumb || page.navLabel,
          item: url,
        },
      ],
    },
  ];
}

export function articleJsonLd(c: SiteContent, article: any): object[] {
  const url = abs(`/conseils/${article.slug}`);
  const nodes: any[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: article.title,
      description: article.metaDescription || article.excerpt,
      datePublished: article.datePublished,
      dateModified: article.datePublished,
      inLanguage: "fr-FR",
      author: { "@type": "Organization", name: c.meta.siteName, url: SITE_URL },
      publisher: {
        "@type": "Organization",
        name: c.meta.siteName,
        logo: {
          "@type": "ImageObject",
          url: abs("/assets/logo-full.png"),
          width: 1192,
          height: 253,
        },
      },
      image: abs(c.meta.ogImage),
      mainEntityOfPage: url,
      url,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Conseils", item: abs("/conseils") },
        { "@type": "ListItem", position: 3, name: article.title, item: url },
      ],
    },
  ];
  if (article.faq?.length) {
    nodes.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: article.faq.map((f: any) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  return nodes;
}

export function conseilsIndexJsonLd(c: SiteContent, articles: any[]): object[] {
  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Conseils SecretPub",
      description:
        "Guides pratiques sur l'enseigne, la signalétique, l'impression et le textile personnalisé.",
      url: abs("/conseils"),
      hasPart: articles.map((a) => ({
        "@type": "Article",
        headline: a.title,
        url: abs(`/conseils/${a.slug}`),
      })),
    },
    { "@context": "https://schema.org", ...localBusiness(c) },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Conseils", item: abs("/conseils") },
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
