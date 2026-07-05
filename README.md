# Medical Entrepreneurship & Innovation

Website for a Massachusetts-facing medical entrepreneurship program with a
UMass Chan OEE track.

Live: https://rahulkumarr18.github.io/oee-medical-entrepreneurship/

## What it is

A multi-page static site for students, clinicians, engineers, professors,
founders, investors, and sponsors who want to learn healthcare entrepreneurship,
present early medical technology ideas, and meet across Worcester, Boston, and
Cambridge.

## Pages

- `index.html` - landing page with animated network hero
- `about.html` - program purpose, audience, and Massachusetts scope
- `program.html` - events, program cycle, and UMass Chan OEE track
- `network.html` - regional and national ecosystem map
- `showcase.html` - pitch and project showcase format
- `partners.html` - sponsors, hosts, affiliations, and support model
- `team.html` - organizing team and speaker lanes
- `join.html` - paths for attendees, project teams, speakers, mentors, and sponsors

## Assets

- `styles.css` - blue / periwinkle design system
- `net.js` - animated network map (vanilla canvas; respects prefers-reduced-motion)
- `site.js` - nav, scroll reveals, hero intro, timeline fill
- `.nojekyll` - serve files as-is on GitHub Pages

No build step. Run a static server to preview:

```bash
python3 -m http.server 8000
```

## Team

Faculty sponsor: Nathaniel Hafer, PhD. Student leads: Rahul Kumar (team lead,
primary contact), Sasha Hussain, and Jielu Yu.
