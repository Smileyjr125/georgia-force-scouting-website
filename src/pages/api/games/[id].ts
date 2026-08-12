import type { APIRoute } from "astro";
import { getManagementEnvironment } from "../../../lib/contentful";

const ALLOWED_PLATFORMS = ["youtube", "nfhs", "other"];

export const PATCH: APIRoute = async ({ params, request }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing game id" }), { status: 400 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  if (body.videoPlatform && !ALLOWED_PLATFORMS.includes(body.videoPlatform)) {
    return new Response(JSON.stringify({ error: `videoPlatform must be one of: ${ALLOWED_PLATFORMS.join(", ")}` }), { status: 400 });
  }

  try {
    const environment = await getManagementEnvironment();
    const entry = await environment.getEntry(id);

    if (body.tag !== undefined) entry.fields.tag = { "en-US": body.tag };
    if (body.label !== undefined) entry.fields.label = { "en-US": body.label };
    if (body.videoPlatform !== undefined) entry.fields.videoPlatform = { "en-US": body.videoPlatform };
    if (body.videoUrl !== undefined) entry.fields.videoUrl = { "en-US": body.videoUrl };

    const updated = await entry.update();
    await updated.publish();

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message ?? "Failed to update game" }), { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing game id" }), { status: 400 });
  }

  try {
    const environment = await getManagementEnvironment();
    const entry = await environment.getEntry(id);
    if (entry.isPublished()) {
      await entry.unpublish();
    }
    await entry.delete();

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message ?? "Failed to delete game" }), { status: 500 });
  }
};
