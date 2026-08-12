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

  const name = (body.name ?? "").toString().trim();
  if (!name) {
    return new Response(JSON.stringify({ error: "Team name is required" }), { status: 400 });
  }

  try {
    const environment = await getManagementEnvironment();

    // Make sure the slug is unique — append -2, -3, etc. if needed.
    const baseSlug = slugify(name) || "team";
    let slug = baseSlug;
    let attempt = 1;
    while (true) {
      const existing = await environment.getEntries({
        content_type: "team",
        "fields.slug": slug,
        limit: 1,
      });
      if (existing.items.length === 0) break;
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    const entry = await environment.createEntry("team", {
      fields: {
        name: { "en-US": name },
        slug: { "en-US": slug },
        description: { "en-US": body.description ?? "" },
      },
    });
    await entry.publish();

    return new Response(JSON.stringify({ ok: true, id: entry.sys.id, slug }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message ?? "Failed to create team" }), { status: 500 });
  }
};
