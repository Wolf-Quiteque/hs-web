# Translation Checklist (EN + Mandarin/zh)

Project root: `d:\hs-web`  
Language folders: `en/` (English), `zh/` (Mandarin Chinese)  
Scope for this checklist: **pages/routes only** (HTML files). This file is intended to be used by an LLM as a step-by-step translation QA + completion checklist.

## Goal
- Ensure every page has a correct **English** version in `en/` and a correct **Mandarin** version in `zh/`.
- Keep **structure and behavior** consistent across languages (links, forms, layout hooks, scripts, ids/classes) while translating only user-facing text.

## Definitions
## Source of Truth + Sync Rule (PT -> EN/ZH)
- **Portuguese root files (`/*.html`) are the source of truth for structure and assets.**
- Before translating, always **sync structural/content changes** from the PT page into its `en/` and `zh/` counterparts:
  - layout/sections/components added/removed
  - new or updated images/videos/posters/URLs
  - new CTAs/buttons/cards/news items
  - link targets and navigation structure
  - any JS-driven content that affects visible text
- Only after EN/ZH pages match the PT page structurally should you translate/localize the user-facing text.
- Practical example (Home): if `index.html` changes the hero video `src` or `poster`, the same change must be applied to `en/index.html` and `zh/index.html` (then translate any nearby captions/CTAs).
- **Source-of-truth page**: the canonical page used as the reference for structure and content coverage. In this repo, there are 3 parallel sets:
  - Root pages (likely Portuguese): `/*.html`
  - English pages: `/en/*.html`
  - Mandarin pages: `/zh/*.html`
- **Correctly translated** means:
  - All visible text is translated appropriately for the locale.
  - No leftover Portuguese/other-language strings remain unless intentionally preserved (e.g., brand names, legal entity names).
  - Links, navigation, and page sections match the reference page’s intent.
  - SEO/meta and accessibility text are localized where appropriate.

## Page Inventory (Must Exist + Must Be Correctly Translated)

All pages discovered in:
- Root: `/*.html`
- English: `/en/*.html`
- Mandarin: `/zh/*.html`

### Route Map (Root -> EN -> ZH)
Use this mapping to ensure parity. For each row, confirm:
- Both language files exist.
- Both language pages are fully translated and consistent with the reference page.

| Route / Page Key | Root (reference) | English | Mandarin (zh) |
|---|---|---|---|
| `index` | `index.html` | `en/index.html` | `zh/index.html` |
| `sobrenos` | `sobrenos.html` | `en/sobrenos.html` | `zh/sobrenos.html` |
| `contacto` | `contacto.html` | `en/contacto.html` | `zh/contacto.html` |
| `carreiras` | `carreiras.html` | `en/carreiras.html` | `zh/carreiras.html` |
| `noticias` | `noticias.html` | `en/noticias.html` | `zh/noticias.html` |
| `responsiblidade` | `responsiblidade.html` | `en/responsiblidade.html` | `zh/responsiblidade.html` |
| `area-agricultura` | `area-agricultura.html` | `en/area-agricultura.html` | `zh/area-agricultura.html` |
| `area-construcao` | `area-construcao.html` | `en/area-construcao.html` | `zh/area-construcao.html` |
| `area-imobiliario` | `area-imobiliario.html` | `en/area-imobiliario.html` | `zh/area-imobiliario.html` |
| `area-industrial` | `area-industrial.html` | `en/area-industrial.html` | `zh/area-industrial.html` |
| `area-investimentos` | `area-investimentos.html` | `en/area-investimentos.html` | `zh/area-investimentos.html` |
| `area-logistica` | `area-logistica.html` | `en/area-logistica.html` | `zh/area-logistica.html` |
| `admin` (special) | `admin.html` | (no EN file found) | (no ZH file found) |

Notes:
- `admin.html` is currently only in root. Decide whether it should be translated; if yes, create `en/admin.html` and `zh/admin.html`. If it is internal-only, it may be intentionally excluded.

## Master Checklist (Per Page)
For each page key above, complete the following for **EN** and **ZH**.

Legend:
- `[ ]` not done
- `[x]` done
- `N/A` not applicable

### 1) `index` (Home)
Reference files:
- Root: `index.html`
- English: `en/index.html`
- Mandarin: `zh/index.html`

Sync prerequisite (do this before translation QA):
- [x] (EN) Diff `index.html` vs `en/index.html` and copy over any PT changes (hero video URLs, partner section id/anchor, partner logos/assets), then translate/localize any new/changed strings in EN.
- [x] (ZH) Diff `index.html` vs `zh/index.html` and copy over any PT changes (hero video URLs, partner section id/anchor, partner logos/assets, slideshow images), then translate/localize any new/changed strings in ZH.

**Known issues found (must address while translating/validating):**
- [ ] Root `index.html` currently has `lang="en"` and `og:locale` set to `pt_PT` while the page content is Portuguese; decide the intended root language and make it consistent.
- [ ] Root `index.html` shows visible mojibake/encoding artifacts (e.g., `ConstruÃ§Ã£o`, `NotÃ­cias`, `Segâ€“Sex`). Ensure all translated pages use correct UTF-8 and render cleanly.
- [x] `en/index.html` desktop language switcher includes PT/EN/ZH consistently (fixed missing desktop/sticky switcher parity).
- [x] `zh/index.html` contains no leftover English strings in the referenced content blocks (offcanvas location localized).
- [x] `zh/index.html` news card titles are Mandarin (no English titles left).
- [x] (EN) `en/index.html` `alt` text localized (no Portuguese leftovers found).
- [x] (ZH) `zh/index.html` `alt` text localized (no Portuguese/English leftovers).
- [ ] Links on the home page reference pages not listed in the current translation inventory (example: `parceiros.html`, `area-agricultura-pesca.html`, `noticia-*.html`). Confirm whether these pages exist and must be translated; if yes, add them to this checklist.

EN file: `en/index.html`
- SEO + language
  - [x] `<html lang="en">` present and correct.
  - [x] `<title>` is correct English and matches the brand + page intent.
  - [x] `meta[name=description]` is correct English (no Portuguese leftovers; no mojibake).
  - [x] `og:title`, `og:description`, `og:locale` localized (`en_US`) and consistent with the page.
- Navigation + switcher
  - [x] Desktop header navigation labels are English: About us, Business areas, Careers, News, Social Responsibility, Contact.
  - [x] Mobile hamburger navigation labels are English (match desktop).
  - [x] Language switcher exists in both desktop + mobile and includes PT/EN/ZH consistently.
  - [x] All internal `href` values on EN home use EN routes (avoid linking to root/PT pages).
- Page body content (must be English)
  - [x] About section: subtitle, headline (e.g., `19 Years Building Angola`), and both paragraphs are natural English.
  - [x] Section headings like `Integrated solutions for Angola.` are natural English.
  - [x] Timeline headings/paragraphs are English and dates/units are consistent (e.g., `1st phase`, `1 B USD`).
  - [x] Partners section: heading + CTA are English, and any partner names remain as proper nouns.
  - [x] News section: labels, headings, excerpt text, and `Read more` links are English.
- Footer + forms
  - [x] Newsletter: input placeholder + button label are English.
  - [x] Footer column titles and link labels are English.
  - [x] Business areas list in footer is English and matches the header's business areas (no missing/extra categories).
  - [x] Contact hours text is English and correct.
- Accessibility
  - [x] All `alt` attributes are English (no Portuguese).
  - [x] Any `aria-*` strings (if present) are English.

ZH file: `zh/index.html`
- SEO + language
  - [x] `<html lang="zh">` (or standardize to `zh-CN`) present and correct.
  - [x] `<title>` is correct Mandarin.
  - [x] `meta[name=description]` is correct Mandarin and reads naturally.
  - [x] `og:title`, `og:description`, `og:locale` localized (`zh_CN`) and consistent with the page.
- Navigation + switcher
  - [x] Desktop header navigation labels are Mandarin and natural.
  - [x] Mobile hamburger navigation labels are Mandarin (match desktop).
  - [x] Language switcher exists in both desktop + mobile and includes PT/EN/ZH consistently.
  - [x] All internal `href` values on ZH home use ZH routes (avoid linking to root/PT or EN pages).
- Page body content (must be Mandarin)
  - [x] About section: subtitle/headline/paragraphs are Mandarin and read naturally (no truncated sentences).
  - [x] News section: category labels, titles, and CTAs are Mandarin (no English news titles).
  - [x] Offcanvas “Contacts” area: location/labels are Mandarin (no `Headquarters in Luanda, Angola`).
- Footer + forms
  - [x] Newsletter placeholder + button label are Mandarin.
  - [x] Footer column titles and link labels are Mandarin.
  - [x] Contact hours text is Mandarin and correct.
- Accessibility
  - [x] All `alt` attributes are Mandarin (no Portuguese/English).
  - [x] Any `aria-*` strings (if present) are Mandarin.
### 2) `sobrenos` (About)
- EN `en/sobrenos.html`
  - [x] Translate company/about narrative with correct tone (professional, consistent).
  - [x] Any timelines/values/mission translated and not paraphrased into a different claim.
  - [x] Lists/cards translated (headings + body).
  - [x] `lang`, `<title>`, meta, `alt` localized.
  - [x] Internal links target EN.
- ZH `zh/sobrenos.html`
  - [ ] Translate company/about narrative with correct tone for Mandarin readers.
  - [ ] Any timelines/values/mission translated faithfully (no changed claims).
  - [ ] Lists/cards translated (headings + body).
  - [ ] `lang`, `<title>`, meta, `alt` localized.
  - [ ] Internal links target ZH.

### 3) `contacto` (Contact)
- EN `en/contacto.html`
  - [x] All contact labels translated (name, email, phone, subject, message, etc.).
  - [x] Validation errors/success messages translated.
  - [x] Any contact instructions translated (office hours, response times).
  - [x] `placeholder` text translated.
  - [x] `aria-label` / `aria-describedby` localized if present.
  - [x] Internal links target EN.
- ZH `zh/contacto.html`
  - [x] All contact labels translated (Mandarin).
  - [x] Validation errors/success messages translated (Mandarin).
  - [x] Any contact instructions translated.
  - [x] `placeholder` text translated.
  - [x] `aria-*` localized if present.
  - [x] Internal links target ZH.

### 4) `carreiras` (Careers)
- EN `en/carreiras.html`
  - [ ] Headings/body translated (job/career content).
  - [ ] Any role lists or requirements translated accurately.
  - [ ] Application CTA translated (and links correct).
  - [ ] `lang`, `<title>`, meta, `alt` localized.
  - [ ] Internal links target EN.
- ZH `zh/carreiras.html`
  - [ ] Headings/body translated (Mandarin).
  - [ ] Any role lists or requirements translated accurately.
  - [ ] Application CTA translated (and links correct).
  - [ ] `lang`, `<title>`, meta, `alt` localized.
  - [ ] Internal links target ZH.

### 5) `noticias` (News)
- EN `en/noticias.html`
  - [ ] Translate headings, summaries, and any category labels.
  - [ ] Dates/numbers format: ensure consistent formatting for English readers.
  - [ ] If there are news items/cards, translate each item’s title/excerpt.
  - [ ] `lang`, `<title>`, meta, `alt` localized.
  - [ ] Internal links target EN.
- ZH `zh/noticias.html`
  - [ ] Translate headings, summaries, and any category labels (Mandarin).
  - [ ] Dates/numbers format: ensure consistent formatting for Chinese readers.
  - [ ] If there are news items/cards, translate each item’s title/excerpt.
  - [ ] `lang`, `<title>`, meta, `alt` localized.
  - [ ] Internal links target ZH.

### 6) `responsiblidade` (Responsibility / CSR)
- EN `en/responsiblidade.html`
  - [x] Translate CSR/responsibility content with correct tone and meaning.
  - [x] Ensure terminology is consistent across the site (e.g., sustainability, governance).
  - [x] Lists/cards translated.
  - [x] `lang`, `<title>`, meta, `alt` localized.
  - [x] Internal links target EN.
- ZH `zh/responsiblidade.html`
  - [x] Translate CSR/responsibility content into Mandarin with consistent terminology.
  - [x] Lists/cards translated.
  - [x] `lang`, `<title>`, meta, `alt` localized.
  - [x] Internal links target ZH.

### 7) `area-agricultura` (Agriculture Area)
- EN `en/area-agricultura.html`
  - [ ] Translate sector/area content (services, focus areas, value props).
  - [ ] Translate any technical terms consistently across all “area-*” pages.
  - [ ] CTAs translated; links target EN.
  - [ ] `lang`, `<title>`, meta, `alt` localized.
- ZH `zh/area-agricultura.html`
  - [ ] Translate sector/area content into Mandarin.
  - [ ] Technical terms consistent with other area pages.
  - [ ] CTAs translated; links target ZH.
  - [ ] `lang`, `<title>`, meta, `alt` localized.

### 8) `area-construcao` (Construction Area)
- EN `en/area-construcao.html`
  - [ ] Translate sector/area content.
  - [ ] Keep terminology consistent (construction/engineering).
  - [ ] CTAs translated; links target EN.
  - [ ] `lang`, `<title>`, meta, `alt` localized.
- ZH `zh/area-construcao.html`
  - [ ] Translate sector/area content into Mandarin.
  - [ ] Terminology consistent.
  - [ ] CTAs translated; links target ZH.
  - [ ] `lang`, `<title>`, meta, `alt` localized.

### 9) `area-imobiliario` (Real Estate Area)
- EN `en/area-imobiliario.html`
  - [ ] Translate real estate terminology accurately.
  - [ ] CTAs translated; links target EN.
  - [ ] `lang`, `<title>`, meta, `alt` localized.
- ZH `zh/area-imobiliario.html`
  - [ ] Translate real estate terminology into Mandarin accurately.
  - [ ] CTAs translated; links target ZH.
  - [ ] `lang`, `<title>`, meta, `alt` localized.

### 10) `area-industrial` (Industrial Area)
- EN `en/area-industrial.html`
  - [ ] Translate industrial sector content.
  - [ ] CTAs translated; links target EN.
  - [ ] `lang`, `<title>`, meta, `alt` localized.
- ZH `zh/area-industrial.html`
  - [ ] Translate industrial sector content into Mandarin.
  - [ ] CTAs translated; links target ZH.
  - [ ] `lang`, `<title>`, meta, `alt` localized.

### 11) `area-investimentos` (Investments Area)
- EN `en/area-investimentos.html`
  - [ ] Translate investment terminology carefully (avoid changing meaning/claims).
  - [ ] If there are disclaimers, ensure they are translated accurately.
  - [ ] CTAs translated; links target EN.
  - [ ] `lang`, `<title>`, meta, `alt` localized.
- ZH `zh/area-investimentos.html`
  - [ ] Translate investment terminology into Mandarin carefully.
  - [ ] Disclaimers translated accurately, if present.
  - [ ] CTAs translated; links target ZH.
  - [ ] `lang`, `<title>`, meta, `alt` localized.

### 12) `area-logistica` (Logistics Area)
- EN `en/area-logistica.html`
  - [ ] Translate logistics/supply-chain terminology consistently.
  - [ ] CTAs translated; links target EN.
  - [ ] `lang`, `<title>`, meta, `alt` localized.
- ZH `zh/area-logistica.html`
  - [ ] Translate logistics/supply-chain terminology into Mandarin consistently.
  - [ ] CTAs translated; links target ZH.
  - [ ] `lang`, `<title>`, meta, `alt` localized.

### 13) `admin` (Special / Root-only)
- Root `admin.html`
  - [ ] Decide: should this be localized?
  - [ ] If YES: create `en/admin.html` and `zh/admin.html` and translate UI strings.
  - [ ] If NO: document that it is intentionally excluded from localization scope.

## Global Translation QA Checklist (Applies to Every Page)
Complete this set once per page per language (EN and ZH).

### A) Language + SEO
- [ ] `<html lang="...">` matches the folder language (`en` for English; `zh` or `zh-CN` for Mandarin).
- [ ] `<title>` is localized and meaningful (not a direct awkward literal translation).
- [ ] Meta description is localized if present.
- [ ] OpenGraph (`og:title`, `og:description`) localized if present.
- [ ] Any structured data (JSON-LD) user-facing strings localized if present.

### B) Navigation + Links
- [ ] Header navigation items are translated.
- [ ] Footer navigation items are translated.
- [ ] All internal links stay within the same language namespace:
  - EN pages link to `en/*.html`
  - ZH pages link to `zh/*.html`
- [ ] Language switcher (if present) points to the exact counterpart page (same key).

### C) Content Coverage
- [ ] Every section present in the reference page exists (no missing blocks/cards).
- [ ] Headings (H1/H2/H3) are translated consistently.
- [ ] Paragraph text translated (no leftover Portuguese).
- [ ] Card titles/subtitles translated.
- [ ] Button labels and CTAs translated.
- [ ] Any popups/modals translated.

### D) Forms + UI Messages (If Present)
- [ ] Field labels translated.
- [ ] Placeholders translated.
- [ ] Helper text translated.
- [ ] Validation/error messages translated.
- [ ] Success/confirmation messages translated.
- [ ] Required/optional indicators translated.

### E) Accessibility (If Present)
- [ ] Image `alt` text localized.
- [ ] `aria-label`, `aria-describedby`, `aria-live` text localized.
- [ ] Skip links and accessibility-only text localized.

### F) Non-Translatable / Keep Stable
+Do **not** translate or alter unless you intend to change behavior:
- [ ] `id`, `class`, `data-*` attributes.
- [ ] Script contents, JS hooks, event handlers.
- [ ] URLs (except where the language namespace should differ).
- [ ] Product/brand names (unless there is an official localized form).
- [ ] Legal entity names/registration numbers.

### G) Quality Bar (EN)
- [ ] English reads naturally (not literal word-for-word).
- [ ] Consistent terminology across pages (especially across all `area-*` pages).
- [ ] Tone matches brand (formal vs. friendly) and stays consistent.

### H) Quality Bar (ZH)
- [ ] Mandarin reads naturally for a corporate website.
- [ ] Consistent terminology across pages (especially across all `area-*` pages).
- [ ] Avoid awkward machine-literal phrasing; ensure professional tone.

## Quick “Mismatch” Checks (Use as LLM Instructions)
For each page key:
- [ ] Compare section headings list between root vs EN vs ZH; they should have the same count and intent.
- [ ] Compare navigation link targets; they should be language-scoped.
- [ ] Search for leftover Portuguese terms in EN and ZH files (common misses: menu labels, footer labels, button text).
- [ ] Ensure `href` references don’t accidentally jump across languages.
