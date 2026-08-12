import type { APIRoute } from "astro";

// TEMPORARY — delete this file once the login issue is diagnosed.
// Reveals only metadata about SITE_PASSWORD, never the value itself.
export const GET: APIRoute = async () => {
  const raw = import.meta.env.SITE_PASSWORD;
  const isSet = raw !== undefined && raw !== null;
  const asString = isSet ? String(raw) : "";

  return new Response(
    JSON.stringify(
      {
        isSet,
        rawLength: asString.length,
        trimmedLength: asString.trim().length,
        hasLeadingOrTrailingWhitespace: asString.length !== asString.trim().length,
        firstChar: asString[0] ?? null,
        lastChar: asString[asString.length - 1] ?? null,
      },
      null,
      2
    ),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
