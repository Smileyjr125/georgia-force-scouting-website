import type { APIRoute } from "astro";
import { getManagementEnvironment } from "../../../lib/contentful";

// PATCH /api/formations/:id
// Body: { positions: [{id, char, x, y}, ...] }
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

  if (!Array.isArray(body.positions)) {
    return new Response(JSON.stringify({ error: "positions must be an array" }), { status: 400 });
  }

  try {
    const environment = await getManagementEnvironment();
    const entry = await environment.getEntry(id);

    entry.fields.positions = { "en-US": body.positions };
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
