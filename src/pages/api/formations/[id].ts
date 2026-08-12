import type { APIRoute } from "astro";
import { getManagementEnvironment } from "../../../lib/contentful";

// PATCH /api/formations/:id
// Body: { positions?: [...], plays?: [...] } — either or both may be sent.
// Middleware already guarantees the request is authenticated (has the
// gsic_auth cookie) before this ever runs.
export const PATCH: APIRoute = async ({ params, request }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing formation id" }), { status: 400 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  const hasPositions = body.positions !== undefined;
  const hasPlays = body.plays !== undefined;

  if (!hasPositions && !hasPlays) {
    return new Response(JSON.stringify({ error: "Provide positions and/or plays to update" }), { status: 400 });
  }
  if (hasPositions && !Array.isArray(body.positions)) {
    return new Response(JSON.stringify({ error: "positions must be an array" }), { status: 400 });
  }
  if (hasPlays && !Array.isArray(body.plays)) {
    return new Response(JSON.stringify({ error: "plays must be an array" }), { status: 400 });
  }

  try {
    const environment = await getManagementEnvironment();
    const entry = await environment.getEntry(id);

    if (hasPositions) entry.fields.positions = { "en-US": body.positions };
    if (hasPlays) entry.fields.plays = { "en-US": body.plays };

    const updated = await entry.update();
    await updated.publish();

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message ?? "Failed to save formation" }),
      { status: 500 }
    );
  }
};

// DELETE /api/formations/:id — removes a formation entirely (e.g. one
// created by mistake, or one you've decided isn't worth tracking).
export const DELETE: APIRoute = async ({ params }) => {
  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing formation id" }), { status: 400 });
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
    return new Response(
      JSON.stringify({ error: err.message ?? "Failed to delete formation" }),
      { status: 500 }
    );
  }
};
