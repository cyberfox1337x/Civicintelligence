const recaptchaWidgets = new Map();
let recaptchaConfig = null;
const LIVE_SITE_ORIGIN = "https://civic-intelligence.pages.dev";
const isRedirectingFromLocalFile = redirectUnsupportedLocalAccess();

if (!isRedirectingFromLocalFile) {
  document.addEventListener("DOMContentLoaded", () => {
    bindMarketingMenu();
    bindRevealObserver();
    bindAuthModal();
    bindAuthForms();
    initializeRecaptcha().catch(() => {
      document.querySelectorAll("[data-captcha-mode-text]").forEach((element) => {
        element.textContent = "Captcha could not load. Refresh and try again.";
        element.classList.remove("hidden");
      });
    });
    redirectAuthenticatedAuthPages();
  });
}

function redirectUnsupportedLocalAccess() {
  if (window.location.protocol !== "file:") {
    return false;
  }

  const filename = String(window.location.pathname.split("/").pop() || "").toLowerCase();
  const targetPath =
    filename === "login.html"
      ? "/login"
      : filename === "register.html"
        ? "/register"
        : "/landing";

  window.location.replace(`${LIVE_SITE_ORIGIN}${targetPath}${window.location.search}${window.location.hash}`);
  return true;
}

function bindMarketingMenu() {
  const button = document.getElementById("marketingMenuButton");
  const nav = document.getElementById("marketingNav");
  if (!button || !nav) {
    return;
  }

  button.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    button.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  nav.querySelectorAll("a, button").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
    });
  });
}

function bindAuthModal() {
  const modal = document.getElementById("authModal");
  if (!modal) {
    return;
  }

  document.querySelectorAll("[data-auth-open]").forEach((button) => {
    button.addEventListener("click", () => openAuthModal(button.dataset.authOpen || "login"));
  });

  modal.querySelectorAll("[data-auth-close]").forEach((button) => {
    button.addEventListener("click", closeAuthModal);
  });

  modal.querySelectorAll("[data-auth-tab]").forEach((button) => {
    button.addEventListener("click", () => setAuthModalTab(button.dataset.authTab || "login"));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) {
      closeAuthModal();
    }
  });
}

function bindRevealObserver() {
  const revealItems = Array.from(document.querySelectorAll(".reveal-up"));
  if (revealItems.length === 0) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    {
      threshold: 0.18,
    },
  );

  revealItems.forEach((item) => observer.observe(item));
}

function bindAuthForms() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const loginUsername = document.getElementById("loginUsername");
  const loginPassword = document.getElementById("loginPassword");

  [loginUsername, loginPassword].forEach((element) => {
    element?.addEventListener("input", () => {
      setLoginOtpVisibility(false);
    });
  });

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => handleAuthSubmit(event, "/api/login", "Log In"));
  }

  if (registerForm) {
    registerForm.addEventListener("submit", (event) =>
      handleAuthSubmit(event, "/api/register", "Register"),
    );
  }
}

async function handleAuthSubmit(event, endpoint, idleLabel) {
  event.preventDefault();

  const form = event.currentTarget;
  const submitButton = form.querySelector(".auth-submit");
  const feedback = form.querySelector(".auth-feedback");
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  if (feedback) {
    feedback.textContent = "";
    feedback.classList.add("hidden");
  }

  submitButton.disabled = true;
  submitButton.textContent = "Please wait";

  try {
    if (!payload.recaptchaToken) {
      throw new Error("Complete the captcha check and try again.");
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (endpoint === "/api/login" && result?.code === "OTP_REQUIRED") {
        setLoginOtpVisibility(true);
        document.getElementById("loginOtpCode")?.focus();
      }

      throw new Error(result.error || "Unable to complete that request.");
    }

    closeAuthModal();
    window.location.href = resolvePostAuthDestination(result?.user);
  } catch (error) {
    if (feedback) {
      feedback.textContent = error.message || "Unable to complete that request.";
      feedback.classList.remove("hidden");
    }
  } finally {
    resetRecaptchaForForm(form);
    submitButton.disabled = false;
    submitButton.textContent = idleLabel;
  }
}

async function initializeRecaptcha() {
  if (document.querySelectorAll("[data-recaptcha-container]").length === 0) {
    return;
  }

  try {
    const response = await fetch("/api/auth-config");
    recaptchaConfig = await response.json().catch(() => ({}));
  } catch {
    recaptchaConfig = null;
  }

  if (!recaptchaConfig?.recaptchaSiteKey) {
    return;
  }

  document.querySelectorAll("[data-captcha-mode-text]").forEach((element) => {
    if (recaptchaConfig.recaptchaMode === "testing") {
      element.textContent = "Captcha is running in test mode until live Google reCAPTCHA keys are set.";
      element.classList.remove("hidden");
      return;
    }

    element.textContent = "";
    element.classList.add("hidden");
  });

  await ensureRecaptchaScript();
  window.grecaptcha?.ready(() => hydrateVisibleRecaptcha());
}

function ensureRecaptchaScript() {
  if (window.grecaptcha) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-recaptcha-script="true"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Unable to load captcha.")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.defer = true;
    script.async = true;
    script.dataset.recaptchaScript = "true";
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("Unable to load captcha.")), {
      once: true,
    });
    document.head.appendChild(script);
  });
}

function mountRecaptchaWidget(container) {
  const form = container.closest("form");
  if (!form || recaptchaWidgets.has(form)) {
    return;
  }

  const hiddenInput = form.querySelector('input[name="recaptchaToken"]');
  const feedback = form.querySelector(".auth-feedback");
  const captchaSize = resolveRecaptchaSize(container);
  container.dataset.captchaSize = captchaSize;
  const widgetId = window.grecaptcha.render(container, {
    sitekey: recaptchaConfig.recaptchaSiteKey,
    theme: "dark",
    size: captchaSize,
    callback(token) {
      if (hiddenInput) {
        hiddenInput.value = token;
      }
      if (feedback) {
        feedback.textContent = "";
        feedback.classList.add("hidden");
      }
    },
    "expired-callback"() {
      if (hiddenInput) {
        hiddenInput.value = "";
      }
    },
    "error-callback"() {
      if (hiddenInput) {
        hiddenInput.value = "";
      }
    },
  });

  recaptchaWidgets.set(form, widgetId);
}

function resolveRecaptchaSize(container) {
  const compactViewport = window.matchMedia("(max-width: 340px)").matches;
  const narrowContainer =
    (container.closest(".auth-modal-panel")?.clientWidth || container.clientWidth || 0) < 330;
  return compactViewport || narrowContainer ? "compact" : "normal";
}

function hydrateVisibleRecaptcha(scope = document) {
  if (!window.grecaptcha || !recaptchaConfig?.recaptchaSiteKey) {
    return;
  }

  const containers = Array.from(scope.querySelectorAll("[data-recaptcha-container]"));
  containers.forEach((container) => {
    if (!isCaptchaContainerVisible(container)) {
      return;
    }

    mountRecaptchaWidget(container);
  });
}

function isCaptchaContainerVisible(container) {
  return Boolean(container.offsetParent) && !container.closest(".hidden");
}

function resetRecaptchaForForm(form) {
  const widgetId = recaptchaWidgets.get(form);
  const hiddenInput = form.querySelector('input[name="recaptchaToken"]');
  if (hiddenInput) {
    hiddenInput.value = "";
  }
  if (widgetId !== undefined && window.grecaptcha) {
    window.grecaptcha.reset(widgetId);
  }
}

function openAuthModal(tab = "login") {
  const modal = document.getElementById("authModal");
  if (!modal) {
    return;
  }

  setAuthModalTab(tab);
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  window.requestAnimationFrame(() => {
    hydrateVisibleRecaptcha(modal);
    const selector =
      tab === "register" ? '[data-auth-view="register"] input[name="username"]' : "#loginUsername";
    modal.querySelector(selector)?.focus();
  });
}

function closeAuthModal() {
  const modal = document.getElementById("authModal");
  if (!modal) {
    return;
  }

  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function setAuthModalTab(tab) {
  const modal = document.getElementById("authModal");
  if (!modal) {
    return;
  }

  const isRegister = tab === "register";
  const eyebrow = document.getElementById("authModalEyebrow");
  const title = document.getElementById("authModalTitle");
  const copy = document.getElementById("authModalCopy");

  if (eyebrow) {
    eyebrow.textContent = isRegister ? "Operator Access" : "Secure Access";
  }
  if (title) {
    title.textContent = isRegister ? "Create Account" : "Access Workspace";
  }
  if (copy) {
    copy.textContent = isRegister
      ? "Create a username and password to start building boards and tracking results."
      : "Sign in to reopen boards, continue searches, and keep your case file moving.";
  }

  modal.querySelectorAll("[data-auth-tab]").forEach((button) => {
    const isActive = button.dataset.authTab === tab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  modal.querySelectorAll("[data-auth-view]").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.authView === tab);
  });

  hydrateVisibleRecaptcha(modal);
}

async function redirectAuthenticatedAuthPages() {
  if (!document.body.classList.contains("auth-body")) {
    return;
  }

  try {
    const response = await fetch("/api/me");
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.user) {
      return;
    }

    window.location.replace(resolvePostAuthDestination(payload.user));
  } catch {}
}

function resolvePostAuthDestination(user) {
  const next = new URLSearchParams(window.location.search).get("next");
  if (next) {
    return next;
  }

  const role = String(user?.role || "").trim().toLowerCase();
  if (role === "owner" || role === "admin") {
    return "./admin";
  }

  return "./index.html";
}

function setLoginOtpVisibility(isVisible) {
  const otpField = document.getElementById("loginOtpField");
  const otpInput = document.getElementById("loginOtpCode");
  if (!otpField || !otpInput) {
    return;
  }

  otpField.classList.toggle("hidden", !isVisible);
  otpInput.required = isVisible;
  if (!isVisible) {
    otpInput.value = "";
  }
}

window.addEventListener("pageshow", () => {
  const usernameInput = document.getElementById("loginUsername");
  const passwordInput = document.getElementById("loginPassword");
  const otpInput = document.getElementById("loginOtpCode");
  if (usernameInput) {
    usernameInput.value = "";
  }
  if (passwordInput) {
    passwordInput.value = "";
  }
  if (otpInput) {
    otpInput.value = "";
  }

  setLoginOtpVisibility(false);
});
