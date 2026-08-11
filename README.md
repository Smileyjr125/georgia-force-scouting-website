# GSIC Formation Sheet — Astro + Contentful + Netlify

A live, editable version of your formation tendency sheet. Your coaching
staff visits one password-protected URL; anyone can drag formations into
place and the changes save for everyone, instantly.

## How it fits together

- **Astro** renders the page and runs a couple of small server routes.
- **Contentful** stores the formation data (positions, plays, run/pass tags).
- **Netlify** hosts it and runs the server routes (this is why we need the
  Netlify *adapter* — plain static Astro can't save anything).
- A simple password cookie (set in `src/middleware.ts`) gates the whole site.

Nothing here costs money at this scale — Contentful, Netlify, and this
Astro setup are all free at your traffic level.

---

## 1. Create your Contentful space

1. Go to [contentful.com](https://www.contentful.com) and sign up (free).
2. Create a new **Space** — call it something like "GSIC Scouting".
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

This pushes all 27 formations and ~70 charted plays you already have into
your new Contentful space, so you don't have to re-enter anything by hand:

```bash
npm run seed
```

You should see it create the `formation` content type, then a line for
every formation as it's created. Takes under a minute.

## 4. Test it locally

```bash
npm run dev
```

Visit `http://localhost:4321` — you'll hit the login page first. Enter the
`SITE_PASSWORD` you set in `.env`. You should see the full sheet, and
editing/saving a formation should work end-to-end already (check your
Contentful space — the entry should update).

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

Netlify will give you a live URL (like `gsic-formation-sheet.netlify.app`).
Share that with your coaching staff along with the password.

**Alternative (if you'd rather use Git):** push this folder to a GitHub
repo, then in the Netlify dashboard choose "Add new site → Import an
existing project" and point it at the repo. Add the same four environment
variables in the Netlify dashboard before the first deploy.

## Editing formations after launch

Anyone with the site password can click **Edit** on a formation card, drag
players around (they snap to an invisible grid), add or remove positions
with the toolbar, then hit **Save & Done**. It writes straight to
Contentful and publishes immediately — no rebuild or redeploy needed.

## Adding a brand-new formation later

Right now new formations are added through Contentful directly (Content
model → Formation → Add entry), filling in `label`, `groupKey` (`single`,
`pistol`, `empty`, or `twoback`), `groupTitle`, `groupOrder`, `sheetOrder`,
`badges`, an empty `plays` array `[]`, and a starting `positions` array
(you can copy the shape from an existing entry, then rearrange it on the
site itself using Edit mode). If you'd like a proper "Add Formation" button
built into the site instead, that's a reasonable next step.
