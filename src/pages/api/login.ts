import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const password = (form.get("password") ?? "").toString().trim();
  const expected = (import.meta.env.SITE_PASSWORD ?? "").toString().trim();

  if (!expected || password !== expected) {
    return redirect("/login?error=1");
  }

  cookies.set("gsic_auth", "yes", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return redirect("/");
};
