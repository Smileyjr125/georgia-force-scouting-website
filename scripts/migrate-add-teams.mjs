// Run with: npm run migrate:teams
//
// Upgrades an already-seeded space (one where you already ran `npm run
// seed` for GSIC) to support multiple teams/opponents:
//   1. Creates "team" and "game" content types if they don't exist.
//   2. Creates a "GSIC" team entry (if it doesn't already exist) and
//      "AUG" / "WCA" game entries under it, with their real video info.
//   3. Adds a "team" field to the "formation" content type.
//   4. Backfills every existing formation entry that has no team set,
//      linking it to the GSIC team.
//
// Safe to run more than once — every step checks for existing data first.

import "dotenv/config";
import contentfulManagement from "contentful-management";

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const CMA_TOKEN = process.env.CONTENTFUL_CMA_TOKEN;

if (!SPACE_ID || !CMA_TOKEN) {
  console.error("Missing CONTENTFUL_SPACE_ID or CONTENTFUL_CMA_TOKEN in your .env file.");
  process.exit(1);
}

async function ensureContentType(environment, id, definition) {
  try {
    const ct = await environment.getContentType(id);
    console.log(`  Content type "${id}" already exists — reusing it.`);
    return ct;
  } catch {
    console.log(`  Creating content type "${id}"...`);
    const ct = await environment.createContentTypeWithId(id, definition);
    await ct.publish();
    return ct;
  }
}

async function findEntryByField(environment, contentType, fieldPath, value) {
  const res = await environment.getEntries({
    content_type: contentType,
    [fieldPath]: value,
    limit: 1,
  });
  return res.items[0] ?? null;
}

async function main() {
  const client = contentfulManagement.createClient({ accessToken: CMA_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment("master");

  console.log("Step 1: content types");
  await ensureContentType(environment, "team", {
    name: "Team",
    displayField: "name",
    fields: [
      { id: "name", name: "Name", type: "Symbol", required: true },
      { id: "slug", name: "Slug", type: "Symbol", required: true },
      { id: "description", name: "Description", type: "Text", required: false },
    ],
  });

  await ensureContentType(environment, "game", {
    name: "Game",
    displayField: "label",
    fields: [
      { id: "team", name: "Team", type: "Link", linkType: "Entry", required: true,
        validations: [{ linkContentType: ["team"] }] },
      { id: "tag", name: "Tag", type: "Symbol", required: true },
      { id: "label", name: "Label", type: "Symbol", required: true },
      { id: "videoPlatform", name: "Video Platform", type: "Symbol", required: true,
        validations: [{ in: ["youtube", "nfhs", "other"] }] },
      { id: "videoUrl", name: "Video URL", type: "Symbol", required: true },
    ],
  });

  console.log("Step 2: add 'team' field to 'formation' content type");
  const formationCT = await environment.getContentType("formation");
  const alreadyHasTeamField = formationCT.fields.some((f) => f.id === "team");
  if (!alreadyHasTeamField) {
    formationCT.fields.push({
      id: "team",
      name: "Team",
      type: "Link",
      linkType: "Entry",
      required: false, // false so existing entries don't become invalid before backfill
      validations: [{ linkContentType: ["team"] }],
    });
    const updatedCT = await formationCT.update();
    await updatedCT.publish();
    console.log("  Added 'team' field.");
  } else {
    console.log("  'team' field already present — skipping.");
  }

  console.log("Step 3: GSIC team entry");
  let gsicTeam = await findEntryByField(environment, "team", "fields.slug", "gsic");
  if (!gsicTeam) {
    gsicTeam = await environment.createEntry("team", {
      fields: {
        name: { "en-US": "GSIC" },
        slug: { "en-US": "gsic" },
        description: { "en-US": "8-man opponent — SIFA 2025 Championship + WCA film." },
      },
    });
    await gsicTeam.publish();
    console.log(`  Created GSIC team entry (${gsicTeam.sys.id}).`);
  } else {
    console.log(`  GSIC team entry already exists (${gsicTeam.sys.id}).`);
  }

  console.log("Step 4: game entries (AUG, WCA)");
  const gamesToEnsure = [
    {
      tag: "AUG",
      label: "vs. Augusta Eagles (SIFA 2025 Championship)",
      videoPlatform: "youtube",
      videoUrl: "https://www.youtube.com/watch?v=FH4qk8qBXBU",
    },
    {
      tag: "WCA",
      label: "vs. WCA",
      videoPlatform: "nfhs",
      videoUrl: "https://www.nfhsnetwork.com/events/westminster-christian-academy-watkinsville-ga/gamaa4af6cc65",
    },
  ];
  for (const g of gamesToEnsure) {
    const existing = await findEntryByField(environment, "game", "fields.tag", g.tag);
    if (existing) {
      console.log(`  Game "${g.tag}" already exists — skipping.`);
      continue;
    }
    const entry = await environment.createEntry("game", {
      fields: {
        team: { "en-US": { sys: { type: "Link", linkType: "Entry", id: gsicTeam.sys.id } } },
        tag: { "en-US": g.tag },
        label: { "en-US": g.label },
        videoPlatform: { "en-US": g.videoPlatform },
        videoUrl: { "en-US": g.videoUrl },
      },
    });
    await entry.publish();
    console.log(`  Created game "${g.tag}".`);
  }

  console.log("Step 5: backfill existing formations with team = GSIC");
  let skip = 0;
  let backfilled = 0;
  while (true) {
    const page = await environment.getEntries({
      content_type: "formation",
      skip,
      limit: 100,
    });
    if (page.items.length === 0) break;

    for (const entry of page.items) {
      if (entry.fields.team) continue; // already linked
      entry.fields.team = { "en-US": { sys: { type: "Link", linkType: "Entry", id: gsicTeam.sys.id } } };
      const updated = await entry.update();
      await updated.publish();
      backfilled++;
    }
    skip += page.items.length;
    if (skip >= page.total) break;
  }
  console.log(`  Backfilled ${backfilled} formation(s).`);

  console.log("\nDone. GSIC is now a team like any other — visit /teams/gsic on the site.");
}

main().catch((err) => {
  console.error("Migration failed:", err.message || err);
  process.exit(1);
});
