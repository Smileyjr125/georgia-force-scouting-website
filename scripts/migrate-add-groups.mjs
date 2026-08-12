// Run with: npm run migrate:groups
//
// Formation "groups" (Single-Back, Pistol, Empty, Two-Back, or any custom
// ones you've since renamed) used to only exist implicitly — derived from
// whatever formations happened to reference a given groupKey/groupTitle.
// That meant a brand-new team with zero formations had nowhere for a group
// to "come from," so there was no way to add its first formation type.
//
// This script makes groups a real, independent thing in Contentful:
//   1. Creates the "formationGroup" content type if it doesn't exist.
//   2. Scans every existing formation, across every team, and creates one
//      formationGroup entry per distinct (team, groupKey) pair found —
//      using that formation's groupTitle/groupOrder as the group's title/
//      order.
//
// Safe to run more than once — skips any (team, key) pair that already
// has a formationGroup entry.

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
    await environment.getContentType(id);
    console.log(`  Content type "${id}" already exists — reusing it.`);
  } catch {
    console.log(`  Creating content type "${id}"...`);
    const ct = await environment.createContentTypeWithId(id, definition);
    await ct.publish();
  }
}

async function getAllEntriesOfType(environment, contentType) {
  const all = [];
  let skip = 0;
  while (true) {
    const page = await environment.getEntries({ content_type: contentType, skip, limit: 100 });
    all.push(...page.items);
    skip += page.items.length;
    if (page.items.length === 0 || skip >= page.total) break;
  }
  return all;
}

async function main() {
  const client = contentfulManagement.createClient({ accessToken: CMA_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment("master");

  console.log("Step 1: content type");
  await ensureContentType(environment, "formationGroup", {
    name: "Formation Group",
    displayField: "title",
    fields: [
      { id: "team", name: "Team", type: "Link", linkType: "Entry", required: true,
        validations: [{ linkContentType: ["team"] }] },
      { id: "title", name: "Title", type: "Symbol", required: true },
      { id: "key", name: "Key", type: "Symbol", required: true },
      { id: "order", name: "Order", type: "Integer", required: true },
    ],
  });

  console.log("Step 2: scan existing formations for implicit groups");
  const formations = await getAllEntriesOfType(environment, "formation");
  const existingGroups = await getAllEntriesOfType(environment, "formationGroup");

  const existingKeySet = new Set(
    existingGroups.map((g) => `${g.fields.team?.["en-US"]?.sys?.id}::${g.fields.key?.["en-US"]}`)
  );

  // Collect one representative formation per (teamId, groupKey) pair.
  const seen = new Map(); // "teamId::groupKey" -> {teamId, key, title, order}
  for (const f of formations) {
    const teamId = f.fields.team?.["en-US"]?.sys?.id;
    const key = f.fields.groupKey?.["en-US"];
    const title = f.fields.groupTitle?.["en-US"];
    const order = f.fields.groupOrder?.["en-US"] ?? 0;
    if (!teamId || !key) continue;
    const dedupeKey = `${teamId}::${key}`;
    if (!seen.has(dedupeKey)) {
      seen.set(dedupeKey, { teamId, key, title: title || key, order });
    }
  }

  let created = 0;
  for (const { teamId, key, title, order } of seen.values()) {
    if (existingKeySet.has(`${teamId}::${key}`)) {
      console.log(`  Group "${key}" for team ${teamId} already exists — skipping.`);
      continue;
    }
    const entry = await environment.createEntry("formationGroup", {
      fields: {
        team: { "en-US": { sys: { type: "Link", linkType: "Entry", id: teamId } } },
        title: { "en-US": title },
        key: { "en-US": key },
        order: { "en-US": order },
      },
    });
    await entry.publish();
    created++;
    console.log(`  Created group "${title}" (${key}) for team ${teamId}.`);
  }

  console.log(`\nDone. Created ${created} formation group(s). Existing teams' sheets are unaffected — this only adds the missing structure behind them.`);
}

main().catch((err) => {
  console.error("Migration failed:", err.message || err);
  process.exit(1);
});
