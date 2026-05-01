import { getAuthenticatedUser, requirePrivilegedUserOr404 } from "../auth.js";

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname === "/admin" || pathname === "/admin/" || pathname === "/admin.html") {
    const privilegedUser = await requirePrivilegedUserOr404(request, env.DB);
    if (!privilegedUser) {
      return withSecurityHeaders(createStyledNotFoundResponse());
    }

    if (pathname === "/admin" || pathname === "/admin/") {
      return withSecurityHeaders(Response.redirect(new URL("/admin.html", url.origin).toString(), 302));
    }

    return withSecurityHeaders(await next());
  }

  if (pathname !== "/" && pathname !== "/index.html") {
    return withSecurityHeaders(await next());
  }

  const user = await getAuthenticatedUser(request, env.DB);
  if (user) {
    return withSecurityHeaders(await next());
  }

  const landingUrl = new URL("/landing.html", url.origin);
  return withSecurityHeaders(Response.redirect(landingUrl.toString(), 302));
}

function createStyledNotFoundResponse() {
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>404 | Civic Intelligence</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
    />
    <style>
      :root {
        color-scheme: dark;
        --bg: #040507;
        --panel: rgba(10, 13, 18, 0.94);
        --line: rgba(115, 142, 173, 0.16);
        --text: #edf4ff;
        --muted: #8b9ab2;
        --accent: #63b6ff;
      }

      * { box-sizing: border-box; }
      html, body { min-height: 100%; margin: 0; }
      body {
        background:
          radial-gradient(circle at top left, rgba(47, 135, 255, 0.14), transparent 28%),
          radial-gradient(circle at 85% 18%, rgba(99, 182, 255, 0.08), transparent 20%),
          radial-gradient(circle at bottom right, rgba(239, 125, 103, 0.08), transparent 24%),
          linear-gradient(180deg, #07080b 0%, #020304 100%);
        color: var(--text);
        font-family: "Space Grotesk", sans-serif;
      }

      .shell {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 1.2rem 1.5rem;
        border-bottom: 1px solid var(--line);
        background: rgba(5, 7, 11, 0.62);
        backdrop-filter: blur(20px);
      }

      .brand {
        display: grid;
        gap: 0.25rem;
        text-decoration: none;
        color: inherit;
      }

      .eyebrow {
        margin: 0;
        color: var(--accent);
        font-family: "IBM Plex Mono", monospace;
        font-size: 0.74rem;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }

      .brand strong {
        font-size: 1.1rem;
      }

      .main {
        flex: 1;
        display: grid;
        place-items: center;
        padding: 2rem 1rem;
      }

      .panel {
        width: min(100%, 720px);
        padding: 1.5rem;
        border: 1px solid rgba(99, 182, 255, 0.16);
        border-radius: 28px;
        background:
          radial-gradient(circle at top right, rgba(99, 182, 255, 0.08), transparent 30%),
          linear-gradient(180deg, rgba(10, 13, 18, 0.96), rgba(4, 6, 9, 0.98));
        box-shadow: 0 26px 80px rgba(0, 0, 0, 0.42);
      }

      h1 {
        margin: 0.45rem 0 0.9rem;
        font-size: clamp(2.6rem, 7vw, 4.8rem);
        line-height: 0.95;
        letter-spacing: -0.06em;
      }

      p {
        margin: 0;
        color: var(--muted);
        line-height: 1.65;
        max-width: 42rem;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.8rem;
        margin-top: 1.4rem;
      }

      .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 50px;
        padding: 0 1.1rem;
        border: 1px solid transparent;
        border-radius: 999px;
        text-decoration: none;
        color: var(--text);
        background: rgba(255, 255, 255, 0.03);
      }

      .button.primary {
        background: linear-gradient(135deg, rgba(47, 135, 255, 0.92), rgba(99, 182, 255, 0.92));
        color: #03111f;
        font-weight: 700;
      }

      .button.ghost {
        border-color: var(--line);
      }

      @media (max-width: 640px) {
        .header { padding: 1rem; }
        .panel { padding: 1.15rem; border-radius: 24px; }
        .actions { flex-direction: column; }
        .button { width: 100%; }
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <header class="header">
        <a class="brand" href="/landing.html">
          <span class="eyebrow">Civic Intelligence</span>
          <strong>Investigation Platform</strong>
        </a>
      </header>
      <main class="main">
        <section class="panel">
          <p class="eyebrow">404</p>
          <h1>Page not found.</h1>
          <p>
            That route is not available. If you are trying to access the admin panel, only signed-in
            accounts with the <strong>owner</strong> or <strong>admin</strong> role can reach it.
          </p>
          <div class="actions">
            <a class="button primary" href="/landing.html">Back to Landing</a>
            <a class="button ghost" href="/index.html">Workspace</a>
          </div>
        </section>
      </main>
    </div>
  </body>
</html>`;

  return new Response(html, {
    status: 404,
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}

function withSecurityHeaders(response) {
  const nextResponse = new Response(response.body, response);

  nextResponse.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "script-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/",
      "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com",
      "font-src 'self' data: https://cdnjs.cloudflare.com https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://www.google.com https://www.gstatic.com https:",
      "connect-src 'self' https://www.google.com https://www.recaptcha.net",
      "frame-src https://www.google.com https://www.recaptcha.net",
      "manifest-src 'self'",
      "worker-src 'self' blob:",
      "upgrade-insecure-requests",
      "block-all-mixed-content",
    ].join("; "),
  );
  nextResponse.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload",
  );
  nextResponse.headers.set("X-Frame-Options", "DENY");
  nextResponse.headers.set("X-Content-Type-Options", "nosniff");
  nextResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  nextResponse.headers.set(
    "Permissions-Policy",
    [
      "accelerometer=()",
      "camera=()",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "payment=()",
      "usb=()",
      "interest-cohort=()",
      "browsing-topics=()",
    ].join(", "),
  );
  nextResponse.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  nextResponse.headers.set("Cross-Origin-Embedder-Policy", "unsafe-none");
  nextResponse.headers.delete("Cross-Origin-Resource-Policy");
  nextResponse.headers.delete("access-control-allow-origin");

  return nextResponse;
}
