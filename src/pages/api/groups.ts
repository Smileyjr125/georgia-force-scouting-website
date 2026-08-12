import type { APIRoute } from "astro";
import { getManagementEnvironment } from "../../lib/contentful";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  const { teamId, title } = body;
  if (!teamId || !title || !title.trim()) {
    return new Response(JSON.stringify({ error: "teamId and title are required" }), { status: 400 });
  }

  try {
    const environment = await getManagementEnvironment();

    // Make sure the key is unique within this team.
    const baseKey = slugify(title) || "group";
    let key = baseKey;
    let attempt = 1;
    while (true) {
      const existing = await environment.getEntries({
        content_type: "formationGroup",
        "fields.team.sys.id": teamId,
        "fields.key": key,
        limit: 1,
      });
      if (existing.items.length === 0) break;
      attempt++;
      key = `${baseKey}-${attempt}`;
    }

    const entry = await environment.createEntry("formationGroup", {
      fields: {
        team: { "en-US": { sys: { type: "Link", linkType: "Entry", id: teamId } } },
        title: { "en-US": title.trim() },
        key: { "en-US": key },
        order: { "en-US": Date.now() },
      },
    });
    await entry.publish();

    return new Response(JSON.stringify({ ok: true, id: entry.sys.id, key }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message ?? "Failed to create formation type" }), { status: 500 });
  }
};
