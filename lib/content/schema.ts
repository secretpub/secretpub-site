/**
 * Content model for secretpub.fr.
 *
 * The whole editable surface of the site is one JSON object of this shape.
 * `content/default.json` holds the shipped content; the CMS stores overrides
 * in Supabase (table `site_content`, column `data`) which are deep-merged on
 * top at request time. Keep this in sync with `content/default.json`.
 *
 * Rendering: templates in `templates/*.html` are Mustache. Keys ending in
 * `Html` are triple-stache ({{{ }}}) HTML fragments; everything else is text.
 */

export interface LinkItem {
  label: string;
  href: string;
  /** visual style hint for CTA buttons */
  style?: string;
  /** external link marker (adds arrow / target=_blank in template) */
  external?: boolean;
}

export interface HeroSlide {
  variant?: string; // "" | "pp" (green espace-de-commande accent)
  eyebrow: string;
  titleHtml: string; // may contain <span class="mark">…</span>
  sub: string;
  image: string;
  alt: string;
  priority?: boolean; // first slide loads eagerly
  actions: LinkItem[];
}

export interface TrustItem {
  iconHtml: string; // decorative svg, editable but defaulted
  valuePrefix?: string; // e.g. "+"
  value: string; // "10", "3000", "5,0", "24"
  from?: string; // count-up start ("0")
  unit?: string; // "ans", "h"
  label: string;
  href?: string;
  starsHtml?: string;
}

export interface ClientLogo {
  src: string;
  alt: string;
  size?: string; // extra class: "sq" | "lg" | "xl" | ""
}

export interface MetierItem {
  cat: string; // realisation filter key (signa/print/textile/goodies/packaging)
  title: string;
  descHtml: string;
  linkLabel: string;
  img: string;
  alt: string;
  reverse?: boolean;
}

export interface MetierBand {
  num: string;
  title: string;
  tagHtml: string;
  items: MetierItem[];
}

export interface RealPhoto {
  src: string;
  alt: string;
}

export interface RealItem {
  cat: string;
  sub: string;
  cap: string; // caption / title
  catLabel: string; // "Signalétique" etc
  dotClass: string; // signa/print/textile/goodies/packaging
  soc?: string; // société
  desc?: string;
  extra?: boolean; // hidden until "voir plus"
  photos: RealPhoto[]; // first = main
}

export interface Testimonial {
  starsHtml?: string;
  quote: string;
  name: string;
  co: string;
}

export interface Realisations {
  eyebrow: string;
  title: string;
  filters: LinkItem[]; // {label, href=data-filter key}
  items: RealItem[];
  testimonials: Testimonial[];
  ctaText: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface SectorItem {
  n: string;
  title: string;
  img: string;
  alt: string;
  detailsHtml: string;
}

export interface PourQuiCard {
  featured?: boolean;
  badge?: string;
  chipLabel: string;
  chipIconHtml: string;
  title: string;
  desc: string;
  img: string;
  alt: string;
  list: string[];
  ctas: LinkItem[];
}

export interface MethodeStep {
  n: string;
  title: string;
  descHtml: string;
}

export interface FranceService {
  iconHtml: string;
  title: string;
  desc: string;
}

export interface FranceStat {
  n: string;
  label: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface FooterCol {
  title: string;
  links: LinkItem[];
}

export interface SiteContent {
  meta: {
    siteName: string;
    title: string;
    description: string;
    ogImage: string;
    catalogueUrl: string;
    phoneDisplay: string;
    phoneHref: string;
    email: string;
    addressLine: string;
    googleReviewUrl?: string;
  };
  nav: LinkItem[];
  headerCtaLabel: string;
  hero: { slides: HeroSlide[] };
  trust: { items: TrustItem[] };
  clients: { label: string; logos: ClientLogo[] };
  metiersSocle: MetierBand;
  metiersComplement: MetierBand;
  realisations: Realisations;
  secteurs: {
    eyebrow: string;
    title: string;
    heading2: string;
    items: SectorItem[];
  };
  pourqui: { cards: PourQuiCard[] };
  waitlist: {
    pill: string;
    titleHtml: string;
    body: string;
    image: string;
    imageAlt: string;
    caption: string;
    emailPlaceholder: string;
    submitLabel: string;
    confirm: string;
    fine: string;
    count: string;
    countLabel: string;
    promoValue: string;
    promoLabel: string;
    scarcityWidth: string; // "40%"
    scarcityLabel: string;
    perks: string[];
  };
  methode: {
    eyebrow: string;
    title: string;
    steps: MethodeStep[];
    note: string;
  };
  france: {
    eyebrow: string;
    title: string;
    lead: string;
    services: FranceService[];
    stats: FranceStat[];
  };
  faq: {
    eyebrow: string;
    title: string;
    items: FaqItem[];
  };
  contact: {
    eyebrow: string;
    title: string;
    lead: string;
    needOptions: string[];
    activityOptions: string[];
    sitesOptions: string[];
    deepLinkLabel: string;
    submitLabel: string;
    okMessage: string;
    callTitle: string;
    callSub: string;
    officeLabel: string;
    officeValue: string;
    emailLabel: string;
    zoneLabel: string;
    zoneValue: string;
  };
  footer: {
    about: string;
    columns: FooterCol[];
    copyright: string;
    socials: LinkItem[];
  };
}

/** Deep partial for CMS overrides. */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
