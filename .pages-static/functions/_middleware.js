import { getAuthenticatedActiveUser, requirePrivilegedUserOr404 } from "../auth.js";

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname === "/admin" || pathname === "/admin/" || pathname === "/admin.html") {
    const privilegedUser = await requirePrivilegedUserOr404(request, env.DB);
    if (!privilegedUser) {
      return withSecurityHeaders(createStyledNotFoundResponse());
    }

    if (pathname === "/admin/" || pathname === "/admin.html") {
      return withSecurityHeaders(Response.redirect(new URL("/admin", url.origin).toString(), 302));
    }

    return withSecurityHeaders(await next());
  }

  if (pathname !== "/" && pathname !== "/index.html") {
    return withSecurityHeaders(await next());
  }

  const user = await getAuthenticatedActiveUser(request, env.DB);
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
        --bg: #05070b;
        --text: #edf4ff;
        --muted: #9daac0;
        --accent: #63b6ff;
        --accent-soft: #8ac8ff;
      }

      * { box-sizing: border-box; }
      html, body { min-height: 100%; margin: 0; }
      body {
        background:
          radial-gradient(circle at top left, rgba(47, 135, 255, 0.13), transparent 24%),
          radial-gradient(circle at 78% 16%, rgba(99, 182, 255, 0.1), transparent 18%),
          radial-gradient(circle at bottom center, rgba(18, 32, 58, 0.42), transparent 42%),
          linear-gradient(180deg, #07090e 0%, #030408 100%);
        color: var(--text);
        font-family: "Space Grotesk", sans-serif;
        overflow: hidden;
      }

      .shell {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem 1.5rem;
        position: relative;
      }

      .brand {
        position: absolute;
        top: 1.5rem;
        left: 1.5rem;
        display: inline-grid;
        gap: 0.2rem;
        text-decoration: none;
        color: inherit;
        z-index: 1;
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
        font-size: 1rem;
      }

      .scene {
        width: min(100%, 980px);
        text-align: center;
        display: grid;
        justify-items: center;
        gap: 0.85rem;
      }

      .code {
        margin: 0;
        font-size: clamp(7rem, 19vw, 12rem);
        line-height: 0.82;
        letter-spacing: -0.08em;
        font-weight: 700;
        color: var(--accent-soft);
        text-shadow: 0 0 50px rgba(99, 182, 255, 0.12);
      }

      h1 {
        margin: 0;
        font-size: clamp(3.2rem, 8.4vw, 6.2rem);
        line-height: 0.9;
        letter-spacing: -0.07em;
        font-weight: 700;
      }

      p {
        margin: 0;
        color: var(--muted);
        line-height: 1.55;
        font-size: clamp(1rem, 2vw, 1.2rem);
        max-width: 38rem;
      }

      .actions {
        display: flex;
        justify-content: center;
        margin-top: 1rem;
      }

      .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 54px;
        min-width: 240px;
        padding: 0 1.4rem;
        border: 1px solid transparent;
        border-radius: 16px;
        text-decoration: none;
        color: #04111e;
        font-size: 1rem;
        font-weight: 700;
        background: linear-gradient(135deg, rgba(47, 135, 255, 0.94), rgba(99, 182, 255, 0.94));
        box-shadow: 0 16px 48px rgba(47, 135, 255, 0.22);
      }

      @media (max-width: 640px) {
        .shell {
          padding: 5.5rem 1.25rem 2rem;
        }

        .brand {
          top: 1rem;
          left: 1rem;
        }

        .scene {
          gap: 0.7rem;
        }

        .actions,
        .button {
          width: 100%;
        }
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <a class="brand" href="/landing.html">
        <span class="eyebrow">Civic Intelligence</span>
        <strong>Investigation Platform</strong>
      </a>
      <main class="scene">
        <p class="code">404</p>
        <h1>Page not found</h1>
        <p>This page does not exist, or you do not have access to it.</p>
        <div class="actions">
          <a class="button" href="/landing.html">Back to home</a>
        </div>
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
