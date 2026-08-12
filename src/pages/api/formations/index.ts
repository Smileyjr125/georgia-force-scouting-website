import type { APIRoute } from "astro";
import { getManagementEnvironment } from "../../../lib/contentful";

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  const { teamId, groupKey, groupTitle, groupOrder, label } = body;
  if (!teamId || !groupKey || !groupTitle || groupOrder == null || !label) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  try {
    const environment = await getManagementEnvironment();

    const entry = await environment.createEntry("formation", {
      fields: {
        team: { "en-US": { sys: { type: "Link", linkType: "Entry", id: teamId } } },
        label: { "en-US": label },
        groupKey: { "en-US": groupKey },
        groupTitle: { "en-US": groupTitle },
        groupOrder: { "en-US": groupOrder },
        sheetOrder: { "en-US": Date.now() }, // pushes new formations to the end of the group
        badges: { "en-US": [] },
        // Starts with one QB so the diagram isn't empty — coach can add/move from there.
        positions: { "en-US": [{ id: 1, char: "Q", x: 160, y: 100 }] },
        plays: { "en-US": [] },
      },
    });
    await entry.publish();

    return new Response(JSON.stringify({ ok: true, id: entry.sys.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message ?? "Failed to create formation" }), { status: 500 });
  }
};
