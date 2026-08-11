// One-time migration script.
// Run with: npm run seed
//
// Reads the formation data already charted (source-data.mjs) and pushes it
// into Contentful: creates the "formation" content type if it doesn't exist,
// then creates + publishes one entry per formation.

import "dotenv/config";
import contentfulManagement from "contentful-management";
import { groups } from "./source-data.mjs";

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const CMA_TOKEN = process.env.CONTENTFUL_CMA_TOKEN;

if (!SPACE_ID || !CMA_TOKEN) {
  console.error("Missing CONTENTFUL_SPACE_ID or CONTENTFUL_CMA_TOKEN in your .env file.");
  process.exit(1);
}

// --- Convert a hand-drawn text diagram into a positions array, matching
// the same grid the on-page editor uses. ---
const CHAR_W = 15, ROW_H = 40, PAD = 30;
const CANVAS_W = 340, CANVAS_H = 200, GRID = 34, MARGIN = 20;

function snap(v, max) {
  let s = Math.round((v - MARGIN) / GRID) * GRID + MARGIN;
  return Math.max(MARGIN, Math.min(max - MARGIN, s));
}

let idCounter = 1;
function parseDiagramToPositions(diagramText) {
  const lines = diagramText.split("\n");
  const found = [];
  lines.forEach((line, rowIdx) => {
    const re = /\S+/g;
    let match;
    while ((match = re.exec(line)) !== null) {
      const letters = match[0].replace(/[^A-Za-z]/g, "").toUpperCase();
      if (!letters) continue;
      found.push({ char: letters, col: match.index, rowIdx });
    }
  });
  return found.map((r) => ({
    id: idCounter++,
    char: r.char,
    x: snap(PAD + r.col * CHAR_W, CANVAS_W),
    y: snap(40 + r.rowIdx * ROW_H, CANVAS_H),
  }));
}

async function main() {
  const client = contentfulManagement.createClient({ accessToken: CMA_TOKEN });
  const space = await client.getSpace(SPACE_ID);
  const environment = await space.getEnvironment("master");

  console.log("Checking for existing 'formation' content type...");
  let contentType;
  try {
    contentType = await environment.getContentType("formation");
    console.log("Found existing content type — reusing it.");
  } catch {
    console.log("Creating 'formation' content type...");
    contentType = await environment.createContentTypeWithId("formation", {
      name: "Formation",
      displayField: "label",
      fields: [
        { id: "label", name: "Label", type: "Symbol", required: true },
        { id: "groupKey", name: "Group Key", type: "Symbol", required: true },
        { id: "groupTitle", name: "Group Title", type: "Symbol", required: true },
        { id: "groupOrder", name: "Group Order", type: "Integer", required: true },
        { id: "sheetOrder", name: "Sheet Order", type: "Integer", required: true },
        { id: "badges", name: "Badges", type: "Array", items: { type: "Symbol" } },
        { id: "positions", name: "Positions", type: "Object", required: true },
        { id: "plays", name: "Plays", type: "Object", required: true },
      ],
    });
    await contentType.publish();
    console.log("Content type created and published.");
  }

  let created = 0;
  for (let gIdx = 0; gIdx < groups.length; gIdx++) {
    const group = groups[gIdx];
    for (let fIdx = 0; fIdx < group.formations.length; fIdx++) {
      const f = group.formations[fIdx];
      const positions = parseDiagramToPositions(f.diagram);

      const entry = await environment.createEntry("formation", {
        fields: {
          label: { "en-US": f.label },
          groupKey: { "en-US": group.key },
          groupTitle: { "en-US": group.title },
          groupOrder: { "en-US": gIdx },
          sheetOrder: { "en-US": fIdx },
          badges: { "en-US": f.badges || [] },
          positions: { "en-US": positions },
          plays: { "en-US": f.plays },
        },
      });
      await entry.publish();
      created++;
      console.log(`  ✓ [${group.key}] ${f.label}`);
    }
  }

  console.log(`\nDone. Created and published ${created} formation entries.`);
}

main().catch((err) => {
  console.error("Seed failed:", err.message || err);
  process.exit(1);
});
