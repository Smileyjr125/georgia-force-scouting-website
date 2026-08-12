# GSIC Formation Sheet — Astro + Contentful + Netlify

A live, editable scouting site for **all your opponents**, not just one.
Each team gets its own formation sheet at `/teams/team-slug`; there's a
landing page at `/` listing every team with a button to add a new one.
Your coaching staff visits one password-protected URL; anyone can drag
formations into place, add new ones, or scout a brand-new opponent, and
the changes save for everyone, instantly.

## How it fits together

- **Astro** renders the pages and runs a few small server routes.
- **Contentful** stores the data: **Teams** (opponents), **Games** (film
  sources per team, with video links), and **Formations** (linked to a
  team, holding positions + charted plays).
- **Netlify** hosts it and runs the server routes (this is why we need the
  Netlify *adapter* — plain static Astro can't save anything).
- A simple password cookie (set in `src/middleware.ts`) gates the whole
  site — one password for your whole staff, not per-team.

Nothing here costs money at this scale — Contentful, Netlify, and this
Astro setup are all free at your traffic level.

### If you're setting this up for the first time

Follow steps 1–5 below in order.

### If you already seeded GSIC's data before this update

You don't need to redo anything — just run one more command:

```bash
npm run migrate:teams
```

This adds the "Team" and "Game" content types to your existing space,
creates a "GSIC" team entry, creates "AUG"/"WCA" game entries with their
real video links, and links all 27 formations you already charted to
GSIC. It's safe to run more than once — it checks for existing data
before creating anything. After it finishes, visit `/teams/gsic` (or just
click "GSIC" on the landing page) to see your existing sheet, now living
alongside whatever new opponents you add.

---

## 1. Create your Contentful space

1. Go to [contentful.com](https://www.contentful.com) and sign up (free).
2. Create a new **Space** — call it something like "Scouting Reports".
3. In that space, go to **Settings → API keys**.
4. Click **Add API key**. This gives you:
   - **Space ID**
   - **Content Delivery API - access token** (this is `CONTENTFUL_CDA_TOKEN`)
5. Still under Settings → API keys, go to the **Content management tokens**
   tab and click **Generate personal token**. Copy it immediately — this is
   `CONTENTFUL_CMA_TOKEN` and Contentful only shows it once.

You do **not** need to manually build the content model — the seed script
in step 3 creates it for you.

## 2. Set up your local environment

```bash
cd gsic-formation-sheet
npm install
cp .env.example .env
```

Open `.env` and fill in:

```
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_CDA_TOKEN=your_delivery_token
CONTENTFUL_CMA_TOKEN=your_management_token
SITE_PASSWORD=pick_something_your_staff_will_remember
```

## 3. Migrate your existing formation data into Contentful

This pushes all 27 GSIC formations and ~70 charted plays you already have
into your new Contentful space, and sets up the Team/Game structure
around it, so you don't have to re-enter anything by hand:

```bash
npm run seed
npm run migrate:teams
```

Run `seed` first (creates the raw GSIC formation data), then
`migrate:teams` (wraps it in the Team/Game model). You should see each
script print a line as it works. Takes under a minute total.

## 4. Test it locally

```bash
npm run dev
```

Visit `http://localhost:4321` — you'll hit the login page first. Enter the
`SITE_PASSWORD` you set in `.env`. You should land on the team picker page
with a "GSIC" card. Click into it to see the full sheet, and try editing
and saving a formation (check your Contentful space — the entry should
update). Try the "Add a new team" form on the landing page too.

## 5. Deploy to Netlify

**Easiest path (no Git required):**

```bash
npm install -g netlify-cli
netlify login
netlify init
```

Follow the prompts to create a new Netlify site. Then set your environment
variables — either in the Netlify dashboard (**Site settings → Environment
variables**) or via CLI:

```bash
netlify env:set CONTENTFUL_SPACE_ID your_space_id
netlify env:set CONTENTFUL_CDA_TOKEN your_delivery_token
netlify env:set CONTENTFUL_CMA_TOKEN your_management_token
netlify env:set SITE_PASSWORD your_password
```

Then deploy:

```bash
netlify deploy --prod
```

Netlify will give you a live URL (like `scouting-reports.netlify.app`).
Share that with your coaching staff along with the password.

**Alternative (if you'd rather use Git):** push this folder to a GitHub
repo, then in the Netlify dashboard choose "Add new site → Import an
existing project" and point it at the repo. Add the same four environment
variables in the Netlify dashboard before the first deploy.

## Day-to-day usage

**Scouting a new opponent:** go to the landing page, type their name into
"Add a new team," and you're dropped straight into their (empty) sheet.

**Adding a formation to a team:** on that team's sheet, scroll to the
group it belongs in (Single-Back, Pistol, Empty, Two-Back) and click the
dashed "+ Add Formation" tile. Give it a label — it starts as just a lone
QB circle, which you then drag/add positions to using Edit mode, same as
any other formation.

**Editing formations:** click **Edit** on any formation card, drag players
around (they snap to an invisible grid), add or remove positions with the
toolbar, then hit **Save & Done**. Writes straight to Contentful, live
immediately for your whole staff — no rebuild or redeploy needed.

**Adding charted plays (timestamps/outcomes) to a formation:** this part
still goes through Contentful directly for now (Content model → Formation
→ find the entry → edit the `plays` field, which is a JSON array shaped
like `{"t": "12:34", "game": "AUG", "outcome": "run", "label": "Run (L)"}`).
Building a proper on-site UI for this is a reasonable next step if you
want it — just ask.

**Adding a new game/video source to an existing team:** create a new
entry under the "Game" content type in Contentful: link it to the team,
give it a short `tag` (used to match plays to it, e.g. `"HOM"` for a
Homecoming game), a `label`, `videoPlatform` (`youtube`, `nfhs`, or
`other`), and `videoUrl`. Any play whose `game` field matches that tag
will automatically link to it.

