import type { APIRoute } from "astro";
import { getManagementEnvironment } from "../../../lib/contentful";

const ALLOWED_PLATFORMS = ["youtube", "nfhs", "other"];

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  const { teamId, tag, label, videoPlatform, videoUrl } = body;
  if (!teamId || !tag || !label || !videoPlatform || !videoUrl) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }
  if (!ALLOWED_PLATFORMS.includes(videoPlatform)) {
    return new Response(JSON.stringify({ error: `videoPlatform must be one of: ${ALLOWED_PLATFORMS.join(", ")}` }), { status: 400 });
  }

  try {
    const environment = await getManagementEnvironment();

    // Tags must be unique per team — plays reference games by tag alone.
    const existing = await environment.getEntries({
      content_type: "game",
      "fields.team.sys.id": teamId,
      "fields.tag": tag,
      limit: 1,
    });
    if (existing.items.length > 0) {
      return new Response(JSON.stringify({ error: `A game with tag "${tag}" already exists for this team.` }), { status: 409 });
    }

    const entry = await environment.createEntry("game", {
      fields: {
        team: { "en-US": { sys: { type: "Link", linkType: "Entry", id: teamId } } },
        tag: { "en-US": tag },
        label: { "en-US": label },
        videoPlatform: { "en-US": videoPlatform },
        videoUrl: { "en-US": videoUrl },
      },
    });
    await entry.publish();

    return new Response(JSON.stringify({ ok: true, id: entry.sys.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message ?? "Failed to create game" }), { status: 500 });
  }
};
