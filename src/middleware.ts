import { defineMiddleware } from "astro:middleware";

const COOKIE_NAME = "gsic_auth";

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Always allow the login page and the login/logout API routes through.
  if (
    pathname === "/login" ||
    pathname === "/api/login" ||
    pathname === "/api/logout"
  ) {
    return next();
  }

  const authed = context.cookies.get(COOKIE_NAME)?.value === "yes";
  if (!authed) {
    return context.redirect("/login");
  }

  return next();
});
