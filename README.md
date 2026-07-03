# Medical Entrepreneurship & Innovation OEE

Website for the Medical Entrepreneurship & Innovation Optional Enrichment Elective
at UMass Chan Medical School (T.H. Chan School of Medicine).

Live: https://rahulkumarr18.github.io/oee-medical-entrepreneurship/

## What it is
A multi-page static site focused on the networking side of the elective: the
evening speaker-and-dinner series and the people students get to meet across the
Massachusetts / New England healthcare innovation ecosystem.

## Pages
- `index.html` — home, with the animated network hero
- `about.html` — the curricular gap and who it's for
- `program.html` — the six Fall 2026 sessions and outcomes
- `network.html` — the regional and national ecosystem, with a grouped affiliations list
- `showcase.html` — student showcase (Coming Fall 2026)
- `partners.html` — sponsors, affiliations, and how support works
- `team.html` — faculty sponsor, student leads, speakers (grouped by theme)
- `join.html` — eligibility and contact

## Assets
- `styles.css` — blue / periwinkle design system (edit colors/type at `:root`)
- `net.js` — the animated hero network (vanilla canvas; respects prefers-reduced-motion)
- `site.js` — nav, scroll reveals, hero intro
- `.nojekyll` — serve files as-is on GitHub Pages

No build step. Run a static server to preview:
```
python3 -m http.server 8000
```

## Adding headshots
Most team avatars already use photos; only Sasha Hussain currently shows initials
(SH). To add a photo, replace the initials in a `.person .avatar` (in `team.html`)
with `<img src="images/NAME.jpg" alt="" loading="lazy">` (existing photos also use
.webp). Leave `alt` empty: the name sits in the adjacent `.p-name` text, so an empty
alt avoids a screen reader announcing it twice. Square images look best.

## Team
Faculty sponsor: Nathaniel Hafer, PhD (UMass Center for Clinical and Translational
Science; Program in Molecular Medicine). Student leads: Sasha Hussain (primary
contact), Rahul Kumar, Jielu Yu.
