# SEO Implementation & Launch Checklist — Glow Lash Studio

Two halves: what is already built into the site in `website/`, and the operational checklist to run at launch. The target queries are local and intent-heavy — "lash extensions Lawrenceville GA", "volume lashes Duluth", "lash lift near me" — so local SEO carries most of the weight here, and the on-page work exists to support it.

---

## Part 1 — What's implemented on the site

### Semantic HTML

Every page follows the canonical template (`website/_template.html`): a skip link, one `<header>` with `<nav aria-label="Primary">`, one `<main id="main">`, one `<footer>` with both studios' full NAP inside a real `<address>` element, and a single `<h1>` per page with a logical heading hierarchy below it. Phone numbers are `tel:` links. Buttons are buttons, links are links — this matters for accessibility and gives crawlers an unambiguous document outline.

### JSON-LD structured data, per page

Each page carries page-appropriate schema.org markup in the head:

| Page | JSON-LD types |
|---|---|
| Home (`index.html`) | `BeautySalon` ×2 — one entity per studio, each with its own `address`, `geo`, `telephone`, `openingHoursSpecification`, `priceRange`, shared `sameAs` (Instagram) |
| Services / Pricing | `Service` entries with `offers` (price, priceCurrency) matching the canonical price list exactly |
| About | `Person` (founder) with `worksFor`, credentials in `hasCredential` — the E-E-A-T anchor |
| Reviews | `AggregateRating` + individual `Review` items (only ratings actually displayed on the page — never markup invisible ratings) |
| FAQ | `FAQPage` with `Question`/`AcceptedAnswer` mirroring the visible Q&A verbatim |
| Blog posts | `Article` with `author`, `datePublished`, `dateModified` |
| Contact / location pages | `BeautySalon` for the relevant studio + `hasMap` |

The two-location detail is deliberate: two separate `BeautySalon` entities (not one organization with two vague addresses) so each can be matched to its own Google Business Profile.

### Crawling & indexing

- **`sitemap.xml`** listing every indexable page with `lastmod`.
- **`robots.txt`** allowing everything public and referencing the sitemap. The admin dashboard is a separate deploy and additionally carries `<meta name="robots" content="noindex, nofollow">`.
- **Canonical URLs** on every page (`<link rel="canonical" href="https://glowlashstudio.com/…">`), all pointing at the apex domain — pair this with the 301 from `www` described in `docs/deployment.md` §1.1 so only one URL version ever indexes.
- **Open Graph + Twitter Card** tags on every page (`og:type`, `og:site_name`, `og:title`, `og:description`, `og:url`, `og:image`, `summary_large_image`) so shared links render properly in Messages/Instagram/Facebook — where a lash studio's links actually get shared.

### Core Web Vitals tactics

- **Fonts:** `preconnect` to `fonts.googleapis.com` and `fonts.gstatic.com`, and `display=swap` on the Google Fonts request, so text renders immediately in a fallback while Cormorant Garamond and Jost load.
- **Image sizing:** explicit `width`/`height` on `<img>` elements so the browser reserves space — the main defense against layout shift (CLS).
- **Lazy loading:** `loading="lazy"` on below-the-fold images (gallery, cards); hero images load eagerly so LCP isn't delayed.
- **No render-blocking JS:** the single site script loads with `defer`; there are no frameworks, no third-party tag soup, and animations respect `prefers-reduced-motion`.
- **No layout-shifting embeds** above the fold; the booking engine embed lives on its own page.

One CWV task remains open by design: replacing hot-linked Unsplash placeholders with locally hosted, WebP-compressed studio photography (see `docs/deployment.md` §1.3). Until that's done, LCP depends on a third party.

---

## Part 2 — Launch checklist

### 1. Google Business Profile — one profile per studio

Create **two separate profiles**, one for Lawrenceville and one for Duluth, each verified at its own address. Both use the identical business name "Glow Lash Studio" — no keyword stuffing like "Glow Lash Studio — Best Lashes Duluth", which violates GBP guidelines and risks suspension.

For each profile:

- **Categories:** primary "Eyelash salon"; secondary "Beauty salon" and "Waxing hair removal service" only if actually offered — stick to what's real.
- **NAP exactly as canonical** (from `docs/brand-identity.md`): address, suite number, phone, and hours (Tue–Fri 9–7, Sat 9–6, Sun 10–4, Mon closed) character-for-character identical to the website footer.
- **Services:** add each service with its real price — Classic Set $150, Hybrid $185, Volume $220, Mega Volume $260, fills, lifts, tints, brow services. Populated service lists appear directly in the local pack.
- **Photos:** at minimum — exterior with signage, interior/treatment room, 5–10 close-up lash results, team photo. Add 2–4 new photos monthly; recency is a freshness signal and, more importantly, what clients actually judge.
- **Booking link** pointing to the site's booking page (UTM-tagged so GBP traffic is measurable).
- **Q&A:** seed each profile's Q&A with the top 5 real questions (parking, appointment length, fill policy, sensitivity/patch tests) — otherwise strangers answer them for you.

### 2. Search Console + sitemap

- Verify the domain property (`glowlashstudio.com`) in Google Search Console via DNS.
- Submit `https://glowlashstudio.com/sitemap.xml`.
- Request indexing on the home page and both key service pages once live.
- Also verify in **Bing Webmaster Tools** (imports from GSC in one click) — Bing feeds several AI answer engines, which matters for the AEO work below.
- Check the Coverage and Enhancements (FAQ, Review snippets) reports after 2 weeks; fix anything flagged.

### 3. Local citations

Consistency is the entire game: every citation carries the exact canonical NAP, and both locations get listed separately.

Priority order:

1. **Apple Maps** (Apple Business Connect) — free, and default navigation for a majority of the iPhone-heavy clientele.
2. **Yelp** — still weighted in local results and feeds other directories; claim both locations, complete services and photos, but do not pay for ads to make the sales calls stop (they will call regardless).
3. **Nextdoor** — claim the business page; Lawrenceville and Duluth neighborhoods actively trade beauty recommendations there, and recommendations compound.
4. **Facebook/Instagram business profiles** — NAP in bios, linked to GBP where possible.
5. Secondary data brokers (Data Axle, Foursquare/places APIs) get picked up automatically over time; fix errors if they appear rather than paying a citation service upfront.

After launch, grep for any old/placeholder phone numbers or addresses anywhere online and correct them — one inconsistent citation does more harm than one missing citation.

### 4. Review velocity plan

Reviews are the strongest local ranking factor you can influence, and steady beats sudden — 4–6 new reviews per month per location sustained is worth more than 40 in launch week followed by silence.

- Turn on the **review request automation** in the admin dashboard (Marketing → "Review request", currently shipped disabled): SMS 3 hours after an appointment is marked completed, linking straight to the GBP review form (use the short `g.page` review link for each profile).
- Ask only clients who had a good visit — the front desk marks the send at checkout; don't blast the full history.
- **Respond to every review within 48 hours**, including critical ones — calm, specific, no defensiveness. Response rate and quality are visible to every prospective client reading them.
- Never incentivize reviews with discounts (violates Google's policies and Georgia consumer-protection sensibilities), and never gate ("only ask happy clients via a filter app") — filtering software violates GBP terms.
- Quarterly: pull the best review lines onto the website's reviews page (with permission), keeping the on-page `Review` markup honest.

### 5. AEO / GEO — being the answer in AI search

A growing share of "best lash extensions near Duluth" queries are answered by AI surfaces (Google AI Overviews, ChatGPT, Perplexity) rather than ten blue links. The site is structured for this, and the operational habits that keep it working:

- **Conversational FAQs:** the FAQ page asks questions the way clients actually phrase them ("How long do lash extensions last?", "Do lash extensions ruin your natural lashes?", "How much are volume lashes in Gwinnett County?") and answers in 2–4 complete, self-contained sentences. Answer engines lift whole passages; write each answer so it stands alone with the business name and city in it. Add new FAQs whenever the front desk hears the same question three times.
- **Consistent NAP everywhere:** entity resolution is how AI systems decide the studio is one real business. The canonical NAP block must be identical on the site, GBP, Apple, Yelp, Nextdoor, and social bios — same suite formatting, same phone formatting.
- **Entity-rich About page:** the About page names the founder, credentials (NovaLash, Borboleta certifications), years of experience, training history, and both cities — concrete, verifiable facts an engine can attribute, marked up with `Person` schema. Vague "passion for beauty" copy gives an answer engine nothing to cite.
- **Journal posts as answer targets:** each blog post targets one question-shaped query ("lash lift vs. lash extensions", "how to make lash extensions last longer") with the direct answer in the first paragraph, then depth. Author byline = the founder, tying content to the entity.
- Check quarterly: ask ChatGPT/Perplexity "best lash studio in Lawrenceville GA" and see whether Glow appears and what facts are cited; wrong facts usually trace back to an inconsistent citation somewhere.

### 6. Ongoing cadence (post-launch)

- Weekly: respond to reviews, add GBP photo(s), confirm booking link works.
- Monthly: one Journal post; check GSC queries for new question phrasing worth adding to the FAQ.
- Quarterly: citation audit, CWV check in PageSpeed Insights (mobile), schema validation (Rich Results Test) after any template change.
