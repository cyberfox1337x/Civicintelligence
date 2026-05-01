const ANNOUNCEMENTS_STORAGE_KEY = "civic-admin-announcements";
const SETTINGS_STORAGE_KEY = "civic-admin-settings";
const LIVE_SITE_ORIGIN = "https://civic-intelligence.pages.dev";
const isRedirectingFromLocalFile = redirectUnsupportedLocalAccess();

const defaultSettings = {
  announcements: true,
};

const defaultAnnouncements = [
  {
    id: crypto.randomUUID(),
    title: "Platform Update",
    message: "Canvas controls and search workflows are synchronized across the workspace.",
    createdAt: new Date().toISOString(),
  },
];

let adminUser = null;
let userRows = [];
let logRows = [];
let adminStats = {
  activeSessions: 0,
  registeredUsers: 0,
  recentEvents: 0,
};
let settingsState = loadJsonStorage(SETTINGS_STORAGE_KEY, defaultSettings);
let announcementRows = loadJsonStorage(ANNOUNCEMENTS_STORAGE_KEY, defaultAnnouncements);

if (!isRedirectingFromLocalFile) {
  document.addEventListener("DOMContentLoaded", async () => {
    bindViewSwitching();
    bindSettingsModal();
    bindUserManagement();
    bindLogsToolbar();
    bindClearLogModal();
    bindAnnouncements();
    await hydrateAdminUser();
    await loadAdminOverview();
    renderAll();
  });
}

function redirectUnsupportedLocalAccess() {
  if (window.location.protocol !== "file:") {
    return false;
  }

  window.location.replace(`${LIVE_SITE_ORIGIN}/admin.html${window.location.search}${window.location.hash}`);
  return true;
}

function bindViewSwitching() {
  const buttons = Array.from(document.querySelectorAll("[data-view]"));
  const panels = Array.from(document.querySelectorAll("[data-panel]"));

  for (const button of buttons) {
    button.addEventListener("click", () => {
      const nextView = button.dataset.view;
      buttons.forEach((item) => item.classList.toggle("is-active", item === button));
      panels.forEach((panel) =>
        panel.classList.toggle("is-active", panel.dataset.panel === nextView),
      );
    });
  }
}

function bindSettingsModal() {
  const modal = document.getElementById("settingsModal");
  const openButton = document.getElementById("settingsOpenButton");
  const closeButton = document.getElementById("settingsCloseButton");
  const tabButtons = Array.from(document.querySelectorAll("[data-settings-tab]"));
  const tabPanels = Array.from(document.querySelectorAll("[data-settings-panel]"));
  const logoutButton = document.getElementById("settingsLogoutButton");

  openButton?.addEventListener("click", () => {
    modal?.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  });

  closeButton?.addEventListener("click", closeSettingsModal);
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeSettingsModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal && !modal.classList.contains("hidden")) {
      closeSettingsModal();
    }
  });

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.settingsTab;
      tabButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      tabButtons.forEach((item) =>
        item.setAttribute("aria-selected", item === button ? "true" : "false"),
      );
      tabPanels.forEach((panel) =>
        panel.classList.toggle("is-active", panel.dataset.settingsPanel === key),
      );
    });
  });

  document.querySelectorAll(".settings-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.settingKey;
      settingsState[key] = !settingsState[key];
      persistJsonStorage(SETTINGS_STORAGE_KEY, settingsState);
      renderSettings();
    });
  });

  logoutButton?.addEventListener("click", handleLogout);
}

function bindUserManagement() {
  const form = document.getElementById("userCreateForm");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const nameInput = document.getElementById("userCreateName");
    const passwordInput = document.getElementById("userCreatePassword");
    const username = nameInput?.value.trim().toLowerCase();
    const tempPassword = passwordInput?.value.trim();

    if (!username || !tempPassword) {
      return;
    }

    try {
      await apiRequest("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({
          username,
          password: tempPassword,
        }),
      });
      nameInput.value = "";
      passwordInput.value = "";
      await loadAdminOverview();
      renderAll();
    } catch (error) {
      alert(error.message || "Unable to create that user.");
    }
  });
}

function bindLogsToolbar() {
  document.getElementById("logSearchInput")?.addEventListener("input", renderLogs);

  document.getElementById("logsClearButton")?.addEventListener("click", () => {
    openClearLogModal();
  });

  document.getElementById("logsRefreshButton")?.addEventListener("click", async () => {
    await loadAdminOverview();
    renderAll();
  });

  document.getElementById("logsDownloadButton")?.addEventListener("click", () => {
    downloadLogPdf();
  });
}

function bindClearLogModal() {
  const modal = document.getElementById("clearLogModal");
  const closeButton = document.getElementById("clearLogCloseButton");
  const cancelButton = document.getElementById("clearLogCancelButton");
  const confirmButton = document.getElementById("clearLogConfirmButton");

  closeButton?.addEventListener("click", closeClearLogModal);
  cancelButton?.addEventListener("click", closeClearLogModal);
  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeClearLogModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal && !modal.classList.contains("hidden")) {
      closeClearLogModal();
    }
  });

  confirmButton?.addEventListener("click", handleClearLogConfirm);
}

function bindAnnouncements() {
  const form = document.getElementById("announcementForm");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const titleInput = document.getElementById("announcementTitle");
    const messageInput = document.getElementById("announcementMessage");
    const title = titleInput?.value.trim();
    const message = messageInput?.value.trim();

    if (!title || !message) {
      return;
    }

    announcementRows.unshift({
      id: crypto.randomUUID(),
      title,
      message,
      createdAt: new Date().toISOString(),
    });

    persistJsonStorage(ANNOUNCEMENTS_STORAGE_KEY, announcementRows);
    titleInput.value = "";
    messageInput.value = "";
    renderAnnouncements();
  });
}

async function hydrateAdminUser() {
  try {
    const response = await fetch("/api/me", {
      credentials: "same-origin",
    });
    const payload = await response.json().catch(() => ({}));
    adminUser = payload?.user || null;
  } catch {
    adminUser = null;
  }
}

async function loadAdminOverview() {
  try {
    const payload = await apiRequest("/api/admin/overview");
    userRows = (payload?.users || []).map((user) => ({
      id: user.id,
      username: user.username || user.displayName || user.email || "user",
      joinedAt: formatDateTime(user.createdAt),
      device: "Workspace account",
      role: toTitleCase(user.role || "normal user"),
      state: user.banned ? "Banned" : "Active",
      isProtected: isProtectedRole(user.role),
    }));
    logRows = (payload?.events || []).map(mapAdminEventRow);
    adminStats = {
      activeSessions: Number(payload?.stats?.activeSessions || 0),
      registeredUsers: Number(payload?.stats?.registeredUsers || userRows.length || 0),
      recentEvents: Number(payload?.stats?.recentEvents || logRows.length || 0),
    };
  } catch (error) {
    console.error("Unable to load admin overview.", error);
    userRows = [];
    logRows = [];
    adminStats = {
      activeSessions: 0,
      registeredUsers: 0,
      recentEvents: 0,
    };
  }
}

function renderAll() {
  renderHome();
  renderUsers();
  renderLogs();
  renderAnnouncements();
  renderSettings();
}

function renderHome() {
  setText("homeActiveSessions", String(adminStats.activeSessions));
  setText("homeRegisteredUsers", String(adminStats.registeredUsers));
  setText("homeRecentEvents", String(adminStats.recentEvents));

  const timeline = document.getElementById("homeTimeline");
  if (timeline) {
    timeline.innerHTML = logRows
      .slice(0, 4)
      .map(
        (row) => `
          <article class="admin-timeline-item">
            <p class="admin-section-kicker">${escapeHtml(row.event)}</p>
            <strong>${escapeHtml(row.username)}</strong>
            <div class="admin-timeline-meta">${escapeHtml(row.dateTime)} - ${escapeHtml(row.message)}</div>
          </article>
        `,
      )
      .join("");
  }

  const currentName = adminUser?.displayName || adminUser?.username || "Authenticated operator";
  setText("homeCurrentAdmin", currentName);
  setText(
    "homeCurrentAdminMeta",
    adminUser?.email || "This page uses the current signed-in session for account context.",
  );
}

function renderUsers() {
  const target = document.getElementById("userList");
  const userCreateForm = document.getElementById("userCreateForm");
  const canManageUsers = isOwnerRole(adminUser?.role);
  if (!target) {
    return;
  }

  userCreateForm?.classList.toggle("hidden", !canManageUsers);

  target.innerHTML = userRows
    .map(
      (user) => `
        <article class="user-card">
          <div class="user-card-main">
            <strong>${escapeHtml(user.username)}</strong>
            <div class="user-meta">Joined ${escapeHtml(user.joinedAt)} - ${escapeHtml(user.device)}</div>
            <div class="user-badge-row">
              <span class="user-badge role">${escapeHtml(user.role)}</span>
              <span class="user-badge ${user.state === "Active" ? "state-active" : "state-away"}">${escapeHtml(user.state)}</span>
            </div>
          </div>
          <div class="user-card-actions">
            <button class="admin-action-button subtle" data-user-action="toggle" data-user-id="${escapeHtml(user.id)}" type="button" ${user.isProtected || !canManageUsers ? "disabled" : ""}>
              <i class="fa-solid fa-ban"></i>
              <span>${user.state === "Active" ? "Ban" : "Restore"}</span>
            </button>
            <button class="admin-action-button danger" data-user-action="remove" data-user-id="${escapeHtml(user.id)}" type="button" ${user.isProtected || !canManageUsers ? "disabled" : ""}>
              <i class="fa-solid fa-trash"></i>
              <span>Remove</span>
            </button>
          </div>
        </article>
      `,
    )
    .join("");

  target.querySelectorAll("[data-user-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      const action = button.dataset.userAction;
      const userId = button.dataset.userId;
      if (!userId) {
        return;
      }

      try {
        if (action === "remove") {
          await apiRequest(`/api/admin/users?id=${encodeURIComponent(userId)}`, {
            method: "DELETE",
          });
        } else {
          await apiRequest(`/api/admin/users?id=${encodeURIComponent(userId)}`, {
            method: "PATCH",
            body: JSON.stringify({}),
          });
        }

        await loadAdminOverview();
        renderAll();
      } catch (error) {
        alert(error.message || "Unable to update that user.");
      }
    });
  });

  setText(
    "userFootNote",
    canManageUsers
      ? `Showing ${userRows.length} users.`
      : `Showing ${userRows.length} users. Owner role is required for account changes.`,
  );
}

function renderLogs() {
  const clearButton = document.getElementById("logsClearButton");
  clearButton?.classList.toggle("hidden", !isOwnerRole(adminUser?.role));
  const filteredRows = getFilteredLogRows();

  const target = document.getElementById("logTableBody");
  if (target) {
    target.innerHTML = filteredRows
      .map(
        (row) => `
          <tr>
            <td>
              <span class="log-badge ${escapeHtml(row.badgeClass)}">
                <i class="fa-solid ${escapeHtml(row.badgeIcon)}" aria-hidden="true"></i>
                <span>${escapeHtml(row.event)}</span>
              </span>
            </td>
            <td>${escapeHtml(row.username)}</td>
            <td>${escapeHtml(row.ipAddress)}</td>
            <td>${escapeHtml(row.dateTime)}</td>
            <td><span class="log-device"><span class="dot ${row.status === "success" ? "ok" : "warn"}"></span>${escapeHtml(row.device)}</span></td>
            <td>${escapeHtml(row.state)}</td>
            <td>${escapeHtml(row.city)}</td>
            <td>${escapeHtml(row.zip)}</td>
            <td>${escapeHtml(row.browserAgent)}</td>
            <td>${escapeHtml(row.message)}</td>
          </tr>
        `,
      )
      .join("");
  }

  setText("logFootNote", `Showing ${filteredRows.length} recent events.`);
}

function getFilteredLogRows() {
  const searchValue = (document.getElementById("logSearchInput")?.value || "").trim().toLowerCase();
  return logRows.filter((row) => {
    if (!searchValue) {
      return true;
    }

    return [
      row.event,
      row.username,
      row.ipAddress,
      row.device,
      row.state,
      row.city,
      row.zip,
      row.browserAgent,
      row.message,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchValue);
  });
}

function renderAnnouncements() {
  const target = document.getElementById("announcementList");
  if (!target) {
    return;
  }

  target.innerHTML = announcementRows
    .map(
      (item) => `
        <article class="announcement-card">
          <p class="admin-section-kicker">Announcement</p>
          <strong>${escapeHtml(item.title)}</strong>
          <div class="announcement-meta">${escapeHtml(formatDateTime(item.createdAt))}</div>
          <p>${escapeHtml(item.message)}</p>
        </article>
      `,
    )
    .join("");
}

function renderSettings() {
  document.querySelectorAll(".settings-toggle").forEach((button) => {
    const key = button.dataset.settingKey;
    const isOn = Boolean(settingsState[key]);
    button.classList.toggle("is-on", isOn);
    button.classList.toggle("is-off", !isOn);
    button.innerHTML = `<span>${isOn ? "On" : "Off"}</span>`;
  });

  const name = adminUser?.displayName || adminUser?.username || "Civic Admin";
  const email = adminUser?.email || "Signed-in session required for account details.";
  setText("settingsAccountName", name);
  setText("settingsAccountEmail", email);
  setText("settingsAvatar", toInitials(name));
}

function mapAdminEventRow(row) {
  const eventType = String(row?.eventType || "").trim().toLowerCase();
  const userAgent = String(row?.userAgent || "");
  const status = isFailedEventType(eventType) ? "failed" : "success";

  return {
    id: row?.id || crypto.randomUUID(),
    eventType,
    event: formatAdminEventLabel(eventType),
    username: row?.username || "Unknown user",
    ipAddress: row?.ipAddress || "Unknown",
    dateTime: formatDateTime(row?.createdAt),
    device: describeUserAgent(userAgent),
    state: row?.state || "Unknown",
    city: row?.city || "Unknown",
    zip: row?.zip || "Unknown",
    browserAgent: userAgent || "Unknown",
    message: row?.message || "No message recorded.",
    status,
    badgeClass: getAdminEventBadgeClass(eventType, status),
    badgeIcon: getAdminEventBadgeIcon(eventType, status),
  };
}

function formatAdminEventLabel(eventType) {
  const labels = {
    login: "Login",
    login_failed: "Login Failed",
    login_blocked: "Login Blocked",
    register: "Register",
    register_failed: "Register Failed",
    search: "Search",
    search_failed: "Search Failed",
    admin_user_created: "User Created",
    admin_user_banned: "User Banned",
    admin_user_restored: "User Restored",
    admin_user_removed: "User Removed",
  };

  return labels[eventType] || toTitleCase(eventType.replaceAll("_", " "));
}

function isFailedEventType(eventType) {
  return eventType.includes("failed") || eventType.includes("blocked") || eventType.includes("banned");
}

function getAdminEventBadgeClass(eventType, status) {
  if (status === "failed") {
    return "failed";
  }

  if (eventType.startsWith("login")) {
    return "login";
  }

  if (eventType.startsWith("register")) {
    return "register";
  }

  if (eventType.startsWith("search")) {
    return "search";
  }

  if (eventType.startsWith("account_otp")) {
    return "otp";
  }

  if (eventType.startsWith("account_")) {
    return "account";
  }

  if (eventType.startsWith("admin_user_")) {
    return "moderation";
  }

  return "success";
}

function getAdminEventBadgeIcon(eventType, status) {
  if (status === "failed") {
    return "fa-triangle-exclamation";
  }

  if (eventType.startsWith("login")) {
    return "fa-right-to-bracket";
  }

  if (eventType.startsWith("register")) {
    return "fa-user-plus";
  }

  if (eventType.startsWith("search")) {
    return "fa-magnifying-glass";
  }

  if (eventType.startsWith("account_otp")) {
    return "fa-shield-halved";
  }

  if (eventType.startsWith("account_")) {
    return "fa-id-badge";
  }

  if (eventType.startsWith("admin_user_")) {
    return "fa-users-gear";
  }

  return "fa-circle-info";
}

function describeUserAgent(userAgent) {
  const value = String(userAgent || "").toLowerCase();
  if (!value) {
    return "Unknown device";
  }

  if (value.includes("iphone")) {
    return "iPhone";
  }

  if (value.includes("ipad")) {
    return "iPad";
  }

  if (value.includes("android")) {
    return "Android";
  }

  if (value.includes("windows")) {
    return "Desktop (Windows)";
  }

  if (value.includes("mac os") || value.includes("macintosh")) {
    return "Desktop (macOS)";
  }

  if (value.includes("linux")) {
    return "Desktop (Linux)";
  }

  return "Browser session";
}

function isProtectedRole(role) {
  const normalizedRole = String(role || "").trim().toLowerCase();
  return normalizedRole === "owner" || normalizedRole === "admin";
}

function isOwnerRole(role) {
  return String(role || "").trim().toLowerCase() === "owner";
}

function downloadLogPdf() {
  const rows = getFilteredLogRows();
  const popup = window.open("", "_blank", "width=1200,height=900");

  if (!popup) {
    alert("Allow popups to export the admin log.");
    return;
  }

  const issuedAt = formatDateTime(Date.now());
  const tableRows = rows
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(row.event)}</td>
          <td>${escapeHtml(row.username)}</td>
          <td>${escapeHtml(row.ipAddress)}</td>
          <td>${escapeHtml(row.dateTime)}</td>
          <td>${escapeHtml(row.device)}</td>
          <td>${escapeHtml(row.state)}</td>
          <td>${escapeHtml(row.city)}</td>
          <td>${escapeHtml(row.zip)}</td>
          <td>${escapeHtml(row.browserAgent)}</td>
          <td>${escapeHtml(row.message)}</td>
        </tr>
      `,
    )
    .join("");

  popup.document.open();
  popup.document.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Civic Intelligence Admin Log</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 24px;
            color: #101828;
          }
          h1 {
            margin: 0 0 8px;
            font-size: 28px;
          }
          p {
            margin: 0 0 16px;
            color: #475467;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #d0d5dd;
            padding: 8px;
            text-align: left;
            vertical-align: top;
          }
          th {
            background: #f2f4f7;
          }
          @page {
            size: landscape;
            margin: 12mm;
          }
        </style>
      </head>
      <body>
        <h1>Civic Intelligence Admin Log</h1>
        <p>Exported ${escapeHtml(issuedAt)} - ${rows.length} events</p>
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Username</th>
              <th>IP Address</th>
              <th>Date &amp; Time</th>
              <th>Device</th>
              <th>State</th>
              <th>City</th>
              <th>ZIP</th>
              <th>Browser Agent</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>${tableRows || '<tr><td colspan="10">No events found.</td></tr>'}</tbody>
        </table>
      </body>
    </html>
  `);
  popup.document.close();
  popup.focus();
  popup.print();
}

async function apiRequest(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(path, {
    method: options.method || "GET",
    headers,
    body: options.body,
    credentials: "same-origin",
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error || "Request failed.");
  }

  return payload;
}

async function handleLogout() {
  try {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "same-origin",
    });
  } catch {}

  window.location.href = "./landing.html";
}

function openClearLogModal() {
  const modal = document.getElementById("clearLogModal");
  modal?.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeClearLogModal() {
  const modal = document.getElementById("clearLogModal");
  modal?.classList.add("hidden");
  document.body.style.overflow = "";
}

async function handleClearLogConfirm() {
  const confirmButton = document.getElementById("clearLogConfirmButton");
  const originalText = confirmButton?.textContent || "";

  if (confirmButton) {
    confirmButton.disabled = true;
    confirmButton.textContent = "Clearing...";
  }

  try {
    await apiRequest("/api/admin/logs", {
      method: "DELETE",
    });
    logRows = [];
    adminStats.recentEvents = 0;
    closeClearLogModal();
    renderAll();
  } catch (error) {
    alert(error.message || "Unable to clear the admin log.");
  } finally {
    if (confirmButton) {
      confirmButton.disabled = false;
      confirmButton.textContent = originalText;
    }
  }
}

function closeSettingsModal() {
  const modal = document.getElementById("settingsModal");
  modal?.classList.add("hidden");
  document.body.style.overflow = "";
}

function loadJsonStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}

function persistJsonStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function toInitials(value) {
  return String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "CI";
}

function toTitleCase(value) {
  return String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
