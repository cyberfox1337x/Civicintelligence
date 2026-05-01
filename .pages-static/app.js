const NODE_TYPES = [
  {
    value: "email",
    label: "Email",
    code: "EML",
    icon: "@",
    faIcon: "fa-envelope",
    placeholder: "victim@example.com",
    description: "Track a mailbox, sender identity, or address found in the case.",
  },
  {
    value: "username",
    label: "Username",
    code: "USR",
    icon: "U",
    faIcon: "fa-user-tag",
    placeholder: "shadow.ops",
    description: "Capture a handle, alias, or profile name tied to activity.",
  },
  {
    value: "phone",
    label: "Phone",
    code: "PHN",
    icon: "+",
    faIcon: "fa-phone",
    placeholder: "+1 (555) 018-2204",
    description: "Store a phone number, burner line, or contact endpoint.",
  },
  {
    value: "ip",
    label: "IP Address",
    code: "IP",
    icon: "#",
    faIcon: "fa-network-wired",
    placeholder: "203.0.113.42",
    description: "Map an address observed in logs, sessions, or infrastructure.",
  },
  {
    value: "domain",
    label: "Domain",
    code: "DOM",
    icon: "D",
    faIcon: "fa-globe",
    placeholder: "shadowportal.net",
    description: "Track a domain, host, or service endpoint inside the board.",
  },
  {
    value: "person",
    label: "Person",
    code: "PRS",
    icon: "P",
    faIcon: "fa-user",
    placeholder: "Adrian Cole",
    description: "Represent a real person, identity, or named subject in the case.",
  },
  {
    value: "device",
    label: "Device",
    code: "DEV",
    icon: "X",
    faIcon: "fa-laptop",
    placeholder: "MacBook Pro - Asset 17",
    description: "Add a workstation, handset, laptop, or hardware artifact.",
  },
  {
    value: "account",
    label: "Account",
    code: "ACT",
    icon: "A",
    faIcon: "fa-id-badge",
    placeholder: "Admin Console Account",
    description: "Track an account entity, tenant profile, or platform identity.",
  },
  {
    value: "hash",
    label: "Hash",
    code: "HSH",
    icon: "*",
    faIcon: "fa-fingerprint",
    placeholder: "44d88612fea8a8f36de82e1278abb02f",
    description: "Store a file hash, fingerprint, or artifact signature.",
  },
  {
    value: "note",
    label: "Note",
    code: "NTE",
    icon: "N",
    faIcon: "fa-note-sticky",
    placeholder: "Observed overlap between account and device activity",
    description: "Drop in analyst notes, observations, or quick findings.",
  },
  {
    value: "location",
    label: "Location",
    code: "LOC",
    icon: "L",
    faIcon: "fa-location-dot",
    placeholder: "Atlanta, Georgia",
    description: "Mark a city, facility, region, or physical point of interest.",
  },
];

const BOARD_COLOR_PRESETS = [
  "#63b6ff",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#6366f1",
  "#14b8a6",
  "#a8a29e",
];

const BOARD_EMOJI_PRESETS = ["\u{1F4C1}", "\u{1F5C2}\uFE0F", "\u{1F575}\uFE0F", "\u{1F9E0}", "\u{1F6F0}\uFE0F", "\u{1F50E}", "\u{1F9FE}", "\u{1F9EC}", "\u{1F5C3}\uFE0F", "\u{1F9FF}"];
const BASE_CANVAS_WIDTH = 2200;
const BASE_CANVAS_HEIGHT = 1400;
const MIN_CANVAS_ZOOM = 0.45;
const MAX_CANVAS_ZOOM = 2.1;
const CANVAS_ZOOM_STEP = 0.15;

const DEFAULT_BOARD_DRAFT = {
  iconEmoji: "\u{1F4C1}",
  accentColor: "#63b6ff",
  status: "active",
};

const SEARCH_PLACEHOLDERS = {
  email: "john.doe@example.com",
  username: "shadow.ops",
  phone: "+12063428631",
  domain: "example.com",
  keyword: "john doe",
  person: "john doe",
  hash: "31c5543c1734d25c7206f5fd",
};

const SEARCH_TYPES = [
  {
    value: "email",
    label: "Email",
    code: "EML",
    faIcon: "fa-envelope",
  },
  {
    value: "username",
    label: "Username",
    code: "USR",
    faIcon: "fa-user-tag",
  },
  {
    value: "phone",
    label: "Phone",
    code: "PHN",
    faIcon: "fa-phone",
  },
  {
    value: "domain",
    label: "Domain",
    code: "DOM",
    faIcon: "fa-globe",
  },
  {
    value: "keyword",
    label: "Keyword",
    code: "KEY",
    faIcon: "fa-magnifying-glass",
  },
  {
    value: "hash",
    label: "Hash",
    code: "HSH",
    faIcon: "fa-fingerprint",
  },
];

const LIVE_SITE_ORIGIN = "https://civic-intelligence.pages.dev";
const isRedirectingFromLocalFile = redirectUnsupportedLocalAccess();

const APP_SETTINGS_STORAGE_KEY = "civic-app-settings";
const DEFAULT_APP_SETTINGS = {
  announcements: true,
  motion: true,
};

const state = {
  boards: [],
  activeBoard: null,
  currentUser: null,
  dashboardSection: "dashboard",
  lastSearchSession: null,
  dashboardMetrics: {
    queriesAvailable: null,
    usersRegistered: null,
    totalQueries: 0,
  },
  sidebarOpen: false,
  nodes: [],
  edges: [],
  selectedNodeId: null,
  linkSourceId: null,
  drag: null,
  edgeFrame: null,
  boardDraft: { ...DEFAULT_BOARD_DRAFT },
  editingBoardId: null,
  pendingRelationship: null,
  nodeDraftProfileImage: "",
  resize: null,
  pan: null,
  justPannedAt: 0,
  canvasZoom: 1,
  shouldCenterCanvas: true,
  appSettings: loadAppSettings(),
  pendingOtpSecret: "",
  otpSetupExpanded: false,
  pendingBoardDeletion: null,
};

const elements = {
  addNodeButton: document.getElementById("addNodeButton"),
  boardForm: document.getElementById("boardForm"),
  boardList: document.getElementById("boardList"),
  boardsView: document.getElementById("boardsView"),
  boardModal: document.getElementById("boardModal"),
  boardColorGrid: document.getElementById("boardColorGrid"),
  boardColorInput: document.getElementById("boardColorInput"),
  boardDraftColorLabel: document.getElementById("boardDraftColorLabel"),
  boardDraftDescription: document.getElementById("boardDraftDescription"),
  boardDraftIcon: document.getElementById("boardDraftIcon"),
  boardDraftName: document.getElementById("boardDraftName"),
  boardDraftPreview: document.getElementById("boardDraftPreview"),
  boardDraftStatus: document.getElementById("boardDraftStatus"),
  boardEmojiGrid: document.getElementById("boardEmojiGrid"),
  boardEmojiInput: document.getElementById("boardEmojiInput"),
  boardModalCopy: document.getElementById("boardModalCopy"),
  boardModalEyebrow: document.getElementById("boardModalEyebrow"),
  boardModalTitle: document.getElementById("boardModalTitle"),
  boardStatusInput: document.getElementById("boardStatusInput"),
  boardStatusToggle: document.getElementById("boardStatusToggle"),
  boardView: document.getElementById("boardView"),
  canvasAddNodeButton: document.getElementById("canvasAddNodeButton"),
  canvasZoomValue: document.getElementById("canvasZoomValue"),
  canvasScroller: document.getElementById("canvasScroller"),
  dashboardEmpty: document.getElementById("dashboardEmpty"),
  dashboardQueriesAvailable: document.getElementById("dashboardQueriesAvailable"),
  dashboardSearchButton: document.getElementById("dashboardSearchButton"),
  dashboardSearchInput: document.getElementById("dashboardSearchInput"),
  dashboardSearchType: document.getElementById("dashboardSearchType"),
  dashboardSearchTypeIcon: document.getElementById("dashboardSearchTypeIcon"),
  dashboardSearchTypeLabel: document.getElementById("dashboardSearchTypeLabel"),
  dashboardSearchTypeMenu: document.getElementById("dashboardSearchTypeMenu"),
  dashboardSearchTypeSelect: document.getElementById("dashboardSearchTypeSelect"),
  dashboardSearchTypeTrigger: document.getElementById("dashboardSearchTypeTrigger"),
  dashboardTotalQueries: document.getElementById("dashboardTotalQueries"),
  dashboardUsersRegistered: document.getElementById("dashboardUsersRegistered"),
  dashboardView: document.getElementById("dashboardView"),
  deleteBoardCancelButton: document.getElementById("deleteBoardCancelButton"),
  deleteBoardConfirmButton: document.getElementById("deleteBoardConfirmButton"),
  deleteBoardMessage: document.getElementById("deleteBoardMessage"),
  edgeCountChip: document.getElementById("edgeCountChip"),
  emptyBoardButton: document.getElementById("emptyBoardButton"),
  appSettingsButton: document.getElementById("appSettingsButton"),
  appProfileButton: document.getElementById("appProfileButton"),
  appProfileFallback: document.getElementById("appProfileFallback"),
  appProfileImage: document.getElementById("appProfileImage"),
  graphCanvas: document.getElementById("graphCanvas"),
  graphPanSurface: document.getElementById("graphPanSurface"),
  graphEdges: document.getElementById("graphEdges"),
  graphNodes: document.getElementById("graphNodes"),
  inspector: document.getElementById("inspector"),
  linkStatusChip: document.getElementById("linkStatusChip"),
  newBoardButton: document.getElementById("newBoardButton"),
  navItems: Array.from(document.querySelectorAll(".nav-item")),
  nodeCountChip: document.getElementById("nodeCountChip"),
  nodeForm: document.getElementById("nodeForm"),
  nodeProfileImageData: document.getElementById("nodeProfileImageData"),
  nodeModal: document.getElementById("nodeModal"),
  nodeModalCopy: document.getElementById("nodeModalCopy"),
  nodeModalEyebrow: document.getElementById("nodeModalEyebrow"),
  nodeModalTitle: document.getElementById("nodeModalTitle"),
  nodeSubmitButton: document.getElementById("nodeSubmitButton"),
  nodeLabelInput: document.getElementById("nodeLabelInput"),
  nodeLabelFieldLabel: document.getElementById("nodeLabelFieldLabel"),
  personMediaPanel: document.getElementById("personMediaPanel"),
  personMediaPreview: document.getElementById("personMediaPreview"),
  personMediaFallback: document.getElementById("personMediaFallback"),
  personMediaImage: document.getElementById("personMediaImage"),
  personPhotoInput: document.getElementById("personPhotoInput"),
  clearPersonPhotoButton: document.getElementById("clearPersonPhotoButton"),
  nodeTypeMenu: document.getElementById("nodeTypeMenu"),
  nodeTypeSelect: document.getElementById("nodeTypeSelect"),
  nodeTypeTrigger: document.getElementById("nodeTypeTrigger"),
  nodeTypeTriggerIcon: document.getElementById("nodeTypeTriggerIcon"),
  nodeTypeTriggerLabel: document.getElementById("nodeTypeTriggerLabel"),
  relationshipCancelButton: document.getElementById("relationshipCancelButton"),
  relationshipForm: document.getElementById("relationshipForm"),
  relationshipLabelInput: document.getElementById("relationshipLabelInput"),
  relationshipModal: document.getElementById("relationshipModal"),
  relationshipModalBackdrop: document.getElementById("relationshipModalBackdrop"),
  relationshipSecondaryCancelButton: document.getElementById("relationshipSecondaryCancelButton"),
  relationshipSourceLabel: document.getElementById("relationshipSourceLabel"),
  relationshipSourceMeta: document.getElementById("relationshipSourceMeta"),
  relationshipSourceType: document.getElementById("relationshipSourceType"),
  relationshipSuggestions: document.getElementById("relationshipSuggestions"),
  relationshipTargetLabel: document.getElementById("relationshipTargetLabel"),
  relationshipTargetMeta: document.getElementById("relationshipTargetMeta"),
  relationshipTargetType: document.getElementById("relationshipTargetType"),
  searchFeedback: document.getElementById("searchFeedback"),
  searchFoundBadge: document.getElementById("searchFoundBadge"),
  searchQuotaBadge: document.getElementById("searchQuotaBadge"),
  searchResultsList: document.getElementById("searchResultsList"),
  searchResultsPanel: document.getElementById("searchResultsPanel"),
  searchResultsTitle: document.getElementById("searchResultsTitle"),
  settingsAdminButton: document.getElementById("settingsAdminButton"),
  settingsAnnouncementsToggle: document.getElementById("settingsAnnouncementsToggle"),
  settingsAvatar: document.getElementById("settingsAvatar"),
  settingsAvatarFallback: document.getElementById("settingsAvatarFallback"),
  settingsAvatarImage: document.getElementById("settingsAvatarImage"),
  settingsOrganization: document.getElementById("settingsOrganization"),
  settingsLogoutButton: document.getElementById("settingsLogoutButton"),
  settingsMotionToggle: document.getElementById("settingsMotionToggle"),
  settingsOtpCode: document.getElementById("settingsOtpCode"),
  settingsOtpCurrentPassword: document.getElementById("settingsOtpCurrentPassword"),
  settingsOtpDisableButton: document.getElementById("settingsOtpDisableButton"),
  settingsOtpEnableButton: document.getElementById("settingsOtpEnableButton"),
  settingsOtpFeedback: document.getElementById("settingsOtpFeedback"),
  settingsOtpFieldsWrap: document.getElementById("settingsOtpFieldsWrap"),
  settingsOtpForm: document.getElementById("settingsOtpForm"),
  settingsOtpSecret: document.getElementById("settingsOtpSecret"),
  settingsOtpSecretWrap: document.getElementById("settingsOtpSecretWrap"),
  settingsOtpSetupButton: document.getElementById("settingsOtpSetupButton"),
  settingsOtpStatusCopy: document.getElementById("settingsOtpStatusCopy"),
  settingsOtpStatusTitle: document.getElementById("settingsOtpStatusTitle"),
  settingsPanels: Array.from(document.querySelectorAll("[data-settings-panel]")),
  settingsPasswordFeedback: document.getElementById("settingsPasswordFeedback"),
  settingsPasswordForm: document.getElementById("settingsPasswordForm"),
  settingsPasswordOtpCode: document.getElementById("settingsPasswordOtpCode"),
  settingsProfileFeedback: document.getElementById("settingsProfileFeedback"),
  settingsProfileImageInput: document.getElementById("settingsProfileImageInput"),
  settingsProfileRemoveButton: document.getElementById("settingsProfileRemoveButton"),
  settingsProfileUploadButton: document.getElementById("settingsProfileUploadButton"),
  settingsTabButtons: Array.from(document.querySelectorAll("[data-settings-tab]")),
  settingsRole: document.getElementById("settingsRole"),
  settingsUsername: document.getElementById("settingsUsername"),
  settingsAccountMeta: document.getElementById("settingsAccountMeta"),
  sidebarBackdrop: document.getElementById("sidebarBackdrop"),
  sidebarBoardCount: document.getElementById("sidebarBoardCount"),
  sidebarBoardList: document.getElementById("sidebarBoardList"),
  shell: document.querySelector(".app-shell"),
  topbarCopy: document.querySelector(".topbar-copy"),
  topbarAddNodeButton: document.getElementById("topbarAddNodeButton"),
  userSearchView: document.getElementById("userSearchView"),
  viewEyebrow: document.getElementById("viewEyebrow"),
  viewSubtitle: document.getElementById("viewSubtitle"),
  viewTitle: document.getElementById("viewTitle"),
  mobileMenuButton: document.getElementById("mobileMenuButton"),
  zoomInButton: document.getElementById("zoomInButton"),
  zoomOutButton: document.getElementById("zoomOutButton"),
  zoomResetButton: document.getElementById("zoomResetButton"),
};

if (!isRedirectingFromLocalFile) {
  document.addEventListener("DOMContentLoaded", init);
}

function redirectUnsupportedLocalAccess() {
  if (window.location.protocol !== "file:") {
    return false;
  }

  const targetPath = "/index.html";
  window.location.replace(`${LIVE_SITE_ORIGIN}${targetPath}${window.location.search}${window.location.hash}`);
  return true;
}

async function init() {
  try {
    await requireAuthenticatedSession();
    applyAppSettings();
    hydrateDashboardMetrics();
    bindEvents();
    applyCanvasZoom();
    renderSearchTypeDropdown();
    renderDashboardOverview();
    updateDashboardSearchPlaceholder();
    renderTypeDropdown();
    renderBoardCustomOptions();
    await loadBoards();
    await syncDashboardMetrics();
    await syncViewFromHash();
  } catch (error) {
    console.error(error);
    redirectToLogin();
  }
}

function bindEvents() {
  elements.newBoardButton.addEventListener("click", () => openBoardModal());
  elements.emptyBoardButton.addEventListener("click", () => openBoardModal());
  elements.canvasAddNodeButton.addEventListener("click", () => openNodeModal());
  elements.appSettingsButton.addEventListener("click", openSettingsModal);
  elements.appProfileButton.addEventListener("click", () => openSettingsModal("account"));
  elements.mobileMenuButton.addEventListener("click", toggleSidebar);
  elements.sidebarBackdrop.addEventListener("click", closeSidebar);
  elements.boardForm.addEventListener("submit", handleBoardSubmit);
  elements.nodeForm.addEventListener("submit", handleNodeSubmit);
  elements.relationshipForm.addEventListener("submit", handleRelationshipSubmit);
  elements.navItems.forEach((item) => {
    item.addEventListener("click", () => handleNavSelection(item.dataset.nav || "dashboard"));
  });
  elements.canvasScroller.addEventListener("pointerdown", beginCanvasPan);
  elements.canvasScroller.addEventListener("wheel", handleCanvasWheel, { passive: false });
  elements.graphCanvas.addEventListener("click", handleCanvasClick);
  elements.zoomInButton.addEventListener("click", () => adjustCanvasZoom(CANVAS_ZOOM_STEP));
  elements.zoomOutButton.addEventListener("click", () => adjustCanvasZoom(-CANVAS_ZOOM_STEP));
  elements.zoomResetButton.addEventListener("click", () => setCanvasZoom(1));
  [
    elements.canvasAddNodeButton,
    elements.zoomInButton,
    elements.zoomOutButton,
    elements.zoomResetButton,
  ].forEach((button) => {
    button.addEventListener("pointerdown", (event) => event.stopPropagation());
  });
  elements.nodeTypeTrigger.addEventListener("click", toggleNodeTypeMenu);
  elements.boardForm.elements.name.addEventListener("input", updateBoardDraftPreview);
  elements.boardForm.elements.description.addEventListener("input", updateBoardDraftPreview);
  elements.boardEmojiInput.addEventListener("input", handleBoardEmojiInput);
  elements.boardColorInput.addEventListener("input", handleBoardColorInput);
  elements.boardStatusToggle.addEventListener("click", handleBoardStatusToggleClick);
  elements.dashboardSearchButton.addEventListener("click", handleDashboardSearch);
  elements.dashboardSearchInput.addEventListener("keydown", handleDashboardSearchInputKeydown);
  elements.dashboardSearchTypeTrigger.addEventListener("click", toggleSearchTypeMenu);
  elements.nodeLabelInput.addEventListener("input", updatePersonPhotoPreview);
  elements.personPhotoInput.addEventListener("change", handlePersonPhotoChange);
  elements.clearPersonPhotoButton.addEventListener("click", clearPersonPhoto);
  elements.relationshipSuggestions.addEventListener("click", handleRelationshipSuggestionClick);
  elements.relationshipCancelButton.addEventListener("click", closeRelationshipModal);
  elements.relationshipSecondaryCancelButton.addEventListener("click", closeRelationshipModal);
  elements.relationshipModalBackdrop.addEventListener("click", closeRelationshipModal);
  elements.settingsLogoutButton.addEventListener("click", handleSettingsLogout);
  elements.settingsAdminButton.addEventListener("click", () => {
    window.location.href = "./admin";
  });
  elements.settingsTabButtons.forEach((button) => {
    button.addEventListener("click", () => setSettingsTab(button.dataset.settingsTab || "toggles"));
  });
  [
    elements.settingsAnnouncementsToggle,
    elements.settingsMotionToggle,
  ].forEach((button) => {
    button.addEventListener("click", () => toggleAppSetting(button.dataset.settingKey || ""));
  });
  elements.settingsProfileUploadButton.addEventListener("click", () => {
    elements.settingsProfileImageInput.click();
  });
  elements.settingsProfileImageInput.addEventListener("change", handleSettingsProfileImageChange);
  elements.settingsProfileRemoveButton.addEventListener("click", handleSettingsProfileImageRemove);
  elements.settingsPasswordForm.addEventListener("submit", handleSettingsPasswordSubmit);
  elements.settingsOtpSetupButton.addEventListener("click", handleSettingsOtpSetupClick);
  elements.settingsOtpForm.addEventListener("submit", handleSettingsOtpEnable);
  elements.settingsOtpDisableButton.addEventListener("click", handleSettingsOtpDisable);
  elements.deleteBoardCancelButton.addEventListener("click", closeDeleteBoardModal);
  elements.deleteBoardConfirmButton.addEventListener("click", confirmDeleteBoardModal);
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleDocumentKeydown);
  window.addEventListener("hashchange", syncViewFromHash);
  window.addEventListener("resize", handleWindowResize);

  document.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", () => closeModal(button.dataset.close));
  });
}

async function loadBoards() {
  const payload = await apiRequest("/api/boards");
  state.boards = payload.boards || [];
  renderBoardLists();
}

async function requireAuthenticatedSession() {
  const payload = await apiRequest("/api/me", { redirectOnUnauthorized: false });
  if (!payload?.user) {
    redirectToLogin();
    throw new Error("Authentication required.");
  }

  state.currentUser = payload.user;
  renderSettingsModal();
  document.body.classList.remove("app-auth-pending");
}

function openSettingsModal(tab = "toggles") {
  renderSettingsModal();
  setSettingsTab(tab);
  openModal("settingsModal");
}

function setSettingsTab(tab) {
  elements.settingsTabButtons.forEach((button) => {
    const isActive = button.dataset.settingsTab === tab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  elements.settingsPanels.forEach((panel) => {
    const isActive = panel.dataset.settingsPanel === tab;
    panel.classList.toggle("hidden", !isActive);
    panel.classList.toggle("is-active", isActive);
  });
}

function renderSettingsModal() {
  const user = state.currentUser || {};
  const role = String(user.role || "normal user").trim();
  const normalizedRole = role.toLowerCase();
  const organization = String(user.organization || "").trim();
  const username = user.displayName || user.username || user.email || "Workspace account";

  elements.settingsUsername.textContent = username;
  elements.settingsAccountMeta.textContent = user.email || "Signed-in session";
  elements.settingsRole.textContent = toDisplayLabel(role);
  elements.settingsOrganization.textContent = organization || "Not set";
  elements.settingsAdminButton.classList.toggle("hidden", !isPrivilegedWorkspaceRole(normalizedRole));
  renderSettingsToggle(elements.settingsAnnouncementsToggle, state.appSettings.announcements);
  renderSettingsToggle(elements.settingsMotionToggle, state.appSettings.motion);
  renderIdentityAvatar(
    elements.settingsAvatarImage,
    elements.settingsAvatarFallback,
    user.profileImage,
    username || "CI",
  );
  renderIdentityAvatar(
    elements.appProfileImage,
    elements.appProfileFallback,
    user.profileImage,
    username || "CI",
  );
  updateOtpSettingsView();
}

function renderSettingsToggle(button, enabled) {
  if (!button) {
    return;
  }

  button.classList.toggle("is-enabled", Boolean(enabled));
  button.setAttribute("aria-pressed", enabled ? "true" : "false");
  button.innerHTML = `
    <span class="settings-toggle-dot"></span>
    <span>${enabled ? "On" : "Off"}</span>
  `;
}

function renderIdentityAvatar(imageElement, fallbackElement, profileImage, fallbackLabel) {
  if (!imageElement || !fallbackElement) {
    return;
  }

  const normalizedImage = String(profileImage || "").trim();
  const initials = getInitials(fallbackLabel || "CI");

  if (normalizedImage) {
    imageElement.src = normalizedImage;
    imageElement.classList.remove("hidden");
    fallbackElement.classList.add("hidden");
    fallbackElement.textContent = initials;
    return;
  }

  imageElement.removeAttribute("src");
  imageElement.classList.add("hidden");
  fallbackElement.classList.remove("hidden");
  fallbackElement.textContent = initials;
}

function updateOtpSettingsView() {
  const user = state.currentUser || {};
  const hasPendingSecret = Boolean(state.pendingOtpSecret);
  const otpEnabled = Boolean(user.otpEnabled);
  const shouldShowSecret = hasPendingSecret;
  const shouldShowFields = hasPendingSecret || otpEnabled || state.otpSetupExpanded;

  elements.settingsOtpSecretWrap.classList.toggle("hidden", !shouldShowSecret);
  elements.settingsOtpFieldsWrap.classList.toggle("hidden", !shouldShowFields);
  elements.settingsOtpCurrentPassword.required = shouldShowFields;
  elements.settingsOtpCode.required = hasPendingSecret || otpEnabled;
  elements.settingsOtpSecret.textContent = state.pendingOtpSecret || (otpEnabled ? "Saved on this account" : "Generate a key first");
  elements.settingsOtpStatusTitle.textContent = otpEnabled
    ? "On"
    : hasPendingSecret
      ? "Finish Setup"
      : state.otpSetupExpanded
        ? "Generate Key"
      : "Off";
  elements.settingsOtpStatusCopy.textContent = otpEnabled
    ? "Use your password and current 6-digit code when signing in."
    : hasPendingSecret
      ? "Add this key to your authenticator app, then enter the code below."
      : state.otpSetupExpanded
        ? "Enter your current password, then generate your setup key."
      : "Add a 6-digit code for extra sign-in protection.";
  elements.settingsOtpSetupButton.classList.toggle("hidden", hasPendingSecret || otpEnabled);
  elements.settingsOtpSetupButton.textContent = state.otpSetupExpanded ? "Generate Key" : "Set Up Code";
  elements.settingsOtpEnableButton.classList.toggle("hidden", !hasPendingSecret);
  elements.settingsOtpDisableButton.classList.toggle("hidden", !otpEnabled);
  elements.settingsOtpEnableButton.textContent = "Turn On";
}

function setSettingsFeedback(element, message, { isError = false } = {}) {
  if (!element) {
    return;
  }

  if (!message) {
    element.textContent = "";
    element.classList.add("hidden");
    element.classList.remove("is-error", "is-success");
    return;
  }

  element.textContent = message;
  element.classList.remove("hidden");
  element.classList.toggle("is-error", isError);
  element.classList.toggle("is-success", !isError);
}

function isPrivilegedWorkspaceRole(role) {
  return role === "owner" || role === "admin";
}

function handleSettingsOtpSetupClick() {
  if (!state.pendingOtpSecret && !state.currentUser?.otpEnabled && !state.otpSetupExpanded) {
    state.otpSetupExpanded = true;
    updateOtpSettingsView();
    setSettingsFeedback(elements.settingsOtpFeedback, "");
    return;
  }

  handleSettingsOtpSetup();
}

function toggleAppSetting(key) {
  if (!(key in state.appSettings)) {
    return;
  }

  state.appSettings[key] = !state.appSettings[key];
  persistAppSettings();
  applyAppSettings();
  renderSettingsModal();
}

function applyAppSettings() {
  document.body.classList.toggle("app-motion-muted", !state.appSettings.motion);
  document.body.dataset.announcements = state.appSettings.announcements ? "on" : "off";
}

async function handleSettingsLogout() {
  try {
    await apiRequest("/api/logout", {
      method: "POST",
      body: JSON.stringify({}),
      redirectOnUnauthorized: false,
    });
  } catch (error) {
    console.error("Unable to close the current session.", error);
  }

  window.location.replace("./landing.html");
}

async function handleSettingsProfileImageChange(event) {
  const [file] = Array.from(event.target.files || []);
  if (!file) {
    return;
  }

  try {
    const profileImage = await readImageAsDataUrl(file);
    const payload = await apiRequest("/api/account", {
      method: "PATCH",
      body: JSON.stringify({
        action: "profile_image",
        profileImage,
      }),
    });
    state.currentUser = {
      ...(state.currentUser || {}),
      profileImage: payload?.user?.profileImage || profileImage,
    };
    renderSettingsModal();
    setSettingsFeedback(elements.settingsProfileFeedback, "Profile picture updated.");
  } catch (error) {
    setSettingsFeedback(elements.settingsProfileFeedback, error.message || "Unable to update the profile image.", { isError: true });
  } finally {
    elements.settingsProfileImageInput.value = "";
  }
}

async function handleSettingsProfileImageRemove() {
  try {
    const payload = await apiRequest("/api/account", {
      method: "PATCH",
      body: JSON.stringify({
        action: "profile_image",
        profileImage: "",
      }),
    });
    state.currentUser = {
      ...(state.currentUser || {}),
      profileImage: payload?.user?.profileImage || "",
    };
    renderSettingsModal();
    setSettingsFeedback(elements.settingsProfileFeedback, "Profile picture removed.");
  } catch (error) {
    setSettingsFeedback(elements.settingsProfileFeedback, error.message || "Unable to remove the profile image.", { isError: true });
  }
}

async function handleSettingsPasswordSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);

  try {
    const payload = await apiRequest("/api/account", {
      method: "PATCH",
      body: JSON.stringify({
        action: "password",
        currentPassword: formData.get("currentPassword"),
        newPassword: formData.get("newPassword"),
        confirmPassword: formData.get("confirmPassword"),
        otpCode: formData.get("otpCode"),
      }),
    });
    state.currentUser = {
      ...(state.currentUser || {}),
      otpEnabled: Boolean(payload?.user?.otpEnabled ?? state.currentUser?.otpEnabled),
    };
    event.currentTarget.reset();
    renderSettingsModal();
    setSettingsFeedback(elements.settingsPasswordFeedback, "Password updated.");
  } catch (error) {
    setSettingsFeedback(elements.settingsPasswordFeedback, error.message || "Unable to update the password.", { isError: true });
  }
}

async function handleSettingsOtpSetup() {
  try {
    const payload = await apiRequest("/api/account", {
      method: "PATCH",
      body: JSON.stringify({
        action: "otp_setup",
        currentPassword: elements.settingsOtpCurrentPassword.value,
      }),
    });
    state.pendingOtpSecret = String(payload?.secret || "");
    state.otpSetupExpanded = true;
    state.currentUser = {
      ...(state.currentUser || {}),
      otpEnabled: Boolean(payload?.otpEnabled),
    };
    updateOtpSettingsView();
    setSettingsFeedback(elements.settingsOtpFeedback, "Key generated. Add it to your authenticator app, then enter the code.");
  } catch (error) {
    setSettingsFeedback(elements.settingsOtpFeedback, error.message || "Unable to generate the setup key.", { isError: true });
  }
}

async function handleSettingsOtpEnable(event) {
  event.preventDefault();
  try {
    const payload = await apiRequest("/api/account", {
      method: "PATCH",
      body: JSON.stringify({
        action: "otp_enable",
        currentPassword: elements.settingsOtpCurrentPassword.value,
        otpCode: elements.settingsOtpCode.value,
      }),
    });
    state.pendingOtpSecret = "";
    state.otpSetupExpanded = false;
    state.currentUser = {
      ...(state.currentUser || {}),
      otpEnabled: Boolean(payload?.otpEnabled),
    };
    renderSettingsModal();
    setSettingsFeedback(elements.settingsOtpFeedback, "Sign-in code turned on.");
  } catch (error) {
    setSettingsFeedback(elements.settingsOtpFeedback, error.message || "Unable to enable one-time passcodes.", { isError: true });
  }
}

async function handleSettingsOtpDisable() {
  try {
    const payload = await apiRequest("/api/account", {
      method: "PATCH",
      body: JSON.stringify({
        action: "otp_disable",
        currentPassword: elements.settingsOtpCurrentPassword.value,
        otpCode: elements.settingsOtpCode.value,
      }),
    });
    state.pendingOtpSecret = String(payload?.secret || "");
    state.otpSetupExpanded = false;
    state.currentUser = {
      ...(state.currentUser || {}),
      otpEnabled: Boolean(payload?.otpEnabled),
    };
    elements.settingsOtpForm.reset();
    renderSettingsModal();
    setSettingsFeedback(elements.settingsOtpFeedback, "Sign-in code turned off.");
  } catch (error) {
    setSettingsFeedback(elements.settingsOtpFeedback, error.message || "Unable to disable one-time passcodes.", { isError: true });
  }
}

function renderBoardLists() {
  if (elements.boardList) {
    elements.boardList.innerHTML = "";
  }
  elements.sidebarBoardList.innerHTML = "";
  elements.sidebarBoardCount.textContent = String(state.boards.length);

  if (state.boards.length === 0) {
    if (elements.dashboardEmpty) {
      elements.dashboardEmpty.classList.remove("hidden");
    }
    if (elements.boardList) {
      elements.boardList.classList.add("hidden");
    }
    return;
  }

  if (elements.dashboardEmpty) {
    elements.dashboardEmpty.classList.add("hidden");
  }
  if (elements.boardList) {
    elements.boardList.classList.remove("hidden");
  }

  for (const board of state.boards) {
    if (elements.boardList) {
      elements.boardList.appendChild(createBoardRow(board));
    }
    elements.sidebarBoardList.appendChild(createSidebarBoardRow(board));
  }
}

function createBoardRow(board) {
  const wrapper = document.createElement("article");
  wrapper.className = "board-row";
  wrapper.style.setProperty("--board-accent-local", board.accentColor || "#63b6ff");

  const button = document.createElement("button");
  button.className = "board-row-button";
  button.type = "button";
  button.addEventListener("click", () => openBoard(board.id));

  const copy = document.createElement("div");

  const title = document.createElement("h3");
  title.className = "board-row-title";
  title.innerHTML = `
    <span class="board-row-title-line">
      ${getBoardIconMarkup(board.iconEmoji || DEFAULT_BOARD_DRAFT.iconEmoji, board.accentColor, "board-row-emoji")}
      <span>${escapeText(board.name)}</span>
    </span>
  `;

  const header = document.createElement("div");
  header.className = "board-row-header";

  const copyStack = document.createElement("div");
  copyStack.className = "board-row-copy";
  copyStack.appendChild(title);

  const actions = document.createElement("div");
  actions.className = "board-row-actions";

  const editButton = document.createElement("button");
  editButton.className = "board-row-edit";
  editButton.type = "button";
  editButton.textContent = "Edit";
  editButton.addEventListener("click", (event) => {
    event.stopPropagation();
    openBoardModal(board);
  });

  const deleteButton = document.createElement("button");
  deleteButton.className = "board-row-delete";
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", (event) => {
    event.stopPropagation();
    handleDeleteBoard(board.id, board.name);
  });

  const description = document.createElement("p");
  description.className = "board-row-description";
  description.textContent = board.description || "No description yet.";

  const metaRow = document.createElement("div");
  metaRow.className = "board-row-meta";

  const status = document.createElement("span");
  const boardStatus = getBoardStatus(board);
  status.className = `status-chip ${boardStatus.toLowerCase()}`;
  status.textContent = boardStatus.toUpperCase();

  const updated = document.createElement("span");
  updated.className = "sidebar-board-meta";
  updated.textContent = `Updated ${formatDate(board.updatedAt)}`;

  actions.append(editButton, deleteButton);
  header.append(copyStack, actions);
  metaRow.append(status, updated);
  copy.append(header, description, metaRow);

  const stats = document.createElement("div");
  stats.className = "board-row-stats";
  stats.innerHTML = `
    <span>${board.nodeCount || 0} nodes</span>
    <span>${formatDate(board.updatedAt)}</span>
  `;

  button.append(copy, stats);
  wrapper.appendChild(button);
  return wrapper;
}

function createSidebarBoardRow(board) {
  const wrapper = document.createElement("article");
  wrapper.className = "sidebar-board-item";
  wrapper.style.setProperty("--board-accent-local", board.accentColor || "#63b6ff");

  const deleteButton = document.createElement("button");
  deleteButton.className = "sidebar-board-delete";
  deleteButton.type = "button";
  deleteButton.setAttribute("aria-label", `Delete ${board.name}`);
  deleteButton.innerHTML = `<i class="fa-solid fa-xmark" aria-hidden="true"></i>`;
  ["click", "pointerdown", "mousedown"].forEach((eventName) => {
    deleteButton.addEventListener(eventName, (event) => event.stopPropagation());
  });
  deleteButton.addEventListener("click", () => handleDeleteBoard(board.id, board.name));

  const button = document.createElement("button");
  button.className = "sidebar-board-button";
  button.type = "button";
  button.addEventListener("click", () => openBoard(board.id));

  const title = document.createElement("p");
  title.className = "sidebar-board-title";
  title.innerHTML = `
    <span class="sidebar-board-title-line">
      ${getBoardIconMarkup(board.iconEmoji || DEFAULT_BOARD_DRAFT.iconEmoji, board.accentColor, "sidebar-board-emoji")}
      <span>${escapeText(board.name)}</span>
    </span>
  `;

  const meta = document.createElement("p");
  const boardStatus = getBoardStatus(board).toLowerCase();
  meta.className = `sidebar-board-meta ${boardStatus}`;
  meta.textContent = boardStatus === "closed" ? "Closed Case File" : "Activate Case File";

  const statusWrap = document.createElement("div");
  statusWrap.className = "sidebar-board-status-wrap";

  const statusLabel = document.createElement("span");
  statusLabel.className = "sidebar-board-status-label";
  statusLabel.textContent = "Status";

  const statusTrigger = document.createElement("button");
  statusTrigger.type = "button";
  statusTrigger.className = `sidebar-board-status-trigger ${boardStatus}`;
  statusTrigger.setAttribute("aria-haspopup", "listbox");
  statusTrigger.setAttribute("aria-expanded", "false");
  statusTrigger.innerHTML = `
    <span>${boardStatus === "closed" ? "Closed" : "Active"}</span>
    <i class="fa-solid fa-chevron-down"></i>
  `;

  const statusMenu = document.createElement("div");
  statusMenu.className = "sidebar-board-status-menu hidden";
  statusMenu.setAttribute("role", "listbox");

  ["active", "closed"].forEach((statusValue) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "sidebar-board-status-option";
    option.dataset.status = statusValue;
    option.setAttribute("role", "option");
    option.textContent = statusValue === "closed" ? "Closed" : "Active";
    option.classList.toggle("selected", statusValue === boardStatus);
    option.addEventListener("click", async (event) => {
      event.stopPropagation();
      await updateSidebarBoardStatus(board, statusValue, statusTrigger, statusMenu, meta);
    });
    statusMenu.appendChild(option);
  });

  [statusTrigger, statusMenu].forEach((element) => {
    ["click", "pointerdown", "mousedown"].forEach((eventName) => {
      element.addEventListener(eventName, (event) => event.stopPropagation());
    });
  });

  statusTrigger.addEventListener("click", () => {
    closeSidebarStatusMenus(statusMenu);
    const isOpen = !statusMenu.classList.contains("hidden");
    statusMenu.classList.toggle("hidden", isOpen);
    statusTrigger.classList.toggle("is-open", !isOpen);
    statusTrigger.setAttribute("aria-expanded", isOpen ? "false" : "true");
  });

  statusWrap.append(statusLabel, statusTrigger, statusMenu);
  button.append(title, meta, statusWrap);
  wrapper.append(deleteButton, button);
  return wrapper;
}

function openBoardModal(board = null) {
  elements.boardForm.reset();
  state.editingBoardId = board?.id || null;
  state.boardDraft = board
    ? {
        iconEmoji: board.iconEmoji || DEFAULT_BOARD_DRAFT.iconEmoji,
        accentColor: board.accentColor || DEFAULT_BOARD_DRAFT.accentColor,
        status: getBoardStatus(board),
      }
    : { ...DEFAULT_BOARD_DRAFT };

  elements.boardForm.elements.boardId.value = state.editingBoardId || "";
  elements.boardForm.elements.name.value = board?.name || "";
  elements.boardForm.elements.description.value = board?.description || "";
  elements.boardEmojiInput.value = state.boardDraft.iconEmoji;
  elements.boardColorInput.value = state.boardDraft.accentColor;
  elements.boardStatusInput.value = state.boardDraft.status;
  elements.boardModalEyebrow.textContent = board ? "Edit Investigation" : "Create Investigation";
  elements.boardModalTitle.textContent = board ? "Edit Board" : "New Board";
  elements.boardModalCopy.textContent = board
    ? "Update the board name, identity, color, or status if something needs correction."
    : "Define the board name, identity, and visual status before adding signals.";
  updateBoardDraftSelectionStates();
  updateBoardDraftPreview();
  openModal("boardModal");
}

async function handleBoardSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const boardId = String(formData.get("boardId") || "").trim();
  const path = boardId
    ? `/api/boards?id=${encodeURIComponent(boardId)}`
    : "/api/boards";
  const method = boardId ? "PATCH" : "POST";

  const payload = await apiRequest(path, {
    method,
    body: JSON.stringify({
      name: formData.get("name"),
      description: formData.get("description"),
      iconEmoji: formData.get("iconEmoji"),
      accentColor: formData.get("accentColor"),
      status: formData.get("status"),
    }),
  });

  closeModal("boardModal");
  await loadBoards();
  await openBoard(payload.board.id);
}

async function openBoard(boardId) {
  const payload = await apiRequest(`/api/boards?id=${encodeURIComponent(boardId)}`);
  state.activeBoard = payload.board;
  state.nodes = payload.nodes || [];
  state.edges = payload.edges || [];
  state.selectedNodeId = null;
  state.linkSourceId = null;
  state.canvasZoom = 1;
  state.shouldCenterCanvas = true;
  closeSidebar();
  window.location.hash = `board=${boardId}`;
  showBoard();
}

async function syncViewFromHash() {
  const boardId = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("board");

  if (!boardId) {
    showHomeView();
    return;
  }

  if (!state.activeBoard || state.activeBoard.id !== boardId) {
    try {
      await openBoard(boardId);
    } catch (error) {
      console.error(error);
      showHomeView();
      alert(error.message);
    }
    return;
  }

  showBoard();
}

function handleNavSelection(section) {
  setDashboardSection(section || "dashboard");
  clearBoardRoute();
  closeSidebar();
  showHomeView();
}

function toggleSidebar() {
  if (state.sidebarOpen) {
    closeSidebar();
    return;
  }

  openSidebar();
}

function openSidebar() {
  state.sidebarOpen = true;
  elements.shell.classList.add("sidebar-open");
  elements.mobileMenuButton.setAttribute("aria-expanded", "true");
}

function closeSidebar() {
  state.sidebarOpen = false;
  elements.shell.classList.remove("sidebar-open");
  elements.mobileMenuButton.setAttribute("aria-expanded", "false");
}

function handleWindowResize() {
  if (window.innerWidth > 960 && state.sidebarOpen) {
    closeSidebar();
  }
}

function setActiveNav(section) {
  elements.navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.nav === section);
  });
}

function applyDashboardCopy(section) {
  const copyMap = {
    dashboard: {
      eyebrow: "",
      title: "Dashboard",
      subtitle: "Use the sidebar to jump into search, open boards, or continue an active case file.",
    },
    "user-search": {
      eyebrow: "",
      title: "User Search",
      subtitle: "Search returned records and inspect results without leaving the workspace.",
    },
    boards: {
      eyebrow: "",
      title: "Boards",
      subtitle: "Create, open, edit, and manage investigation case files from one place.",
    },
  };
  const copy = copyMap[section] || copyMap.dashboard;

  elements.viewEyebrow.textContent = copy.eyebrow;
  elements.viewTitle.textContent = copy.title;
  elements.viewSubtitle.textContent = copy.subtitle;
}

function setDashboardSection(section) {
  state.dashboardSection = section || "dashboard";
}

function clearBoardRoute() {
  const url = new URL(window.location.href);
  url.hash = "";
  window.history.replaceState({}, "", `${url.pathname}${url.search}`);
}

function syncBoardCreateButtons(mode) {
  const currentMode = mode || "default";
  elements.newBoardButton.classList.toggle("hidden", currentMode !== "boards");
}

function showDashboard(section = state.dashboardSection) {
  setDashboardSection(section || "dashboard");
  state.activeBoard = null;
  state.nodes = [];
  state.edges = [];
  state.selectedNodeId = null;
  state.linkSourceId = null;
  document.documentElement.style.setProperty("--board-accent", DEFAULT_BOARD_DRAFT.accentColor);

  elements.dashboardView.classList.remove("hidden");
  elements.userSearchView.classList.add("hidden");
  elements.boardsView.classList.add("hidden");
  elements.boardView.classList.add("hidden");
  syncBoardCreateButtons("default");
  elements.topbarAddNodeButton.classList.add("hidden");
  elements.topbarCopy.classList.remove("hidden");
  applyDashboardCopy(state.dashboardSection);
  elements.viewEyebrow.classList.toggle("hidden", !elements.viewEyebrow.textContent);
  elements.viewSubtitle.classList.remove("hidden");
  setActiveNav(state.dashboardSection);
}

function showUserSearch() {
  setDashboardSection("user-search");
  state.selectedNodeId = null;
  state.linkSourceId = null;
  document.documentElement.style.setProperty(
    "--board-accent",
    state.activeBoard?.accentColor || DEFAULT_BOARD_DRAFT.accentColor,
  );

  elements.dashboardView.classList.add("hidden");
  elements.userSearchView.classList.remove("hidden");
  elements.boardsView.classList.add("hidden");
  elements.boardView.classList.add("hidden");
  syncBoardCreateButtons("default");
  elements.topbarAddNodeButton.classList.add("hidden");
  elements.topbarCopy.classList.remove("hidden");
  applyDashboardCopy("user-search");
  elements.viewEyebrow.classList.toggle("hidden", !elements.viewEyebrow.textContent);
  elements.viewSubtitle.classList.remove("hidden");
  setActiveNav("user-search");
  rerenderSearchResultsFromState();
}

function showBoards() {
  setDashboardSection("boards");
  state.activeBoard = null;
  state.nodes = [];
  state.edges = [];
  state.selectedNodeId = null;
  state.linkSourceId = null;
  document.documentElement.style.setProperty("--board-accent", DEFAULT_BOARD_DRAFT.accentColor);

  elements.dashboardView.classList.add("hidden");
  elements.userSearchView.classList.add("hidden");
  elements.boardsView.classList.remove("hidden");
  elements.boardView.classList.add("hidden");
  syncBoardCreateButtons("boards");
  elements.topbarAddNodeButton.classList.add("hidden");
  elements.topbarCopy.classList.remove("hidden");
  applyDashboardCopy("boards");
  elements.viewEyebrow.classList.toggle("hidden", !elements.viewEyebrow.textContent);
  elements.viewSubtitle.classList.remove("hidden");
  setActiveNav("boards");
}

function showHomeView() {
  if (state.dashboardSection === "user-search") {
    showUserSearch();
    return;
  }

  if (state.dashboardSection === "boards") {
    showBoards();
    return;
  }

  showDashboard("dashboard");
}

function updateDashboardSearchPlaceholder() {
  const selectedType = elements.dashboardSearchType.value || "email";
  const normalizedType = selectedType === "person" ? "keyword" : selectedType;
  elements.dashboardSearchInput.placeholder =
    SEARCH_PLACEHOLDERS[selectedType] ||
    SEARCH_PLACEHOLDERS[normalizedType] ||
    "john.doe@example.com";
}

function renderSearchTypeDropdown() {
  elements.dashboardSearchTypeMenu.innerHTML = "";

  for (const type of SEARCH_TYPES) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "search-type-option";
    button.dataset.type = type.value;
    button.setAttribute("role", "option");
    button.innerHTML = `
      <span class="search-type-option-icon"><i class="fa-solid ${type.faIcon}"></i></span>
      <span class="search-type-option-copy">
        <strong>${type.label}</strong>
      </span>
    `;
    button.addEventListener("click", () => {
      setSelectedSearchType(type.value);
      closeSearchTypeMenu();
      elements.dashboardSearchInput.focus();
    });
    elements.dashboardSearchTypeMenu.appendChild(button);
  }

  setSelectedSearchType(elements.dashboardSearchType.value || "email");
}

function setSelectedSearchType(type) {
  const config = SEARCH_TYPES.find((item) => item.value === type) || SEARCH_TYPES[0];
  elements.dashboardSearchType.value = config.value;
  elements.dashboardSearchTypeMenu.querySelectorAll(".search-type-option").forEach((button) => {
    button.classList.toggle("selected", button.dataset.type === config.value);
  });
  elements.dashboardSearchTypeMenu.dataset.selectedType = config.value;
  elements.dashboardSearchTypeIcon.innerHTML = `<i class="fa-solid ${config.faIcon}"></i>`;
  elements.dashboardSearchTypeLabel.textContent = config.label;
  updateDashboardSearchPlaceholder();
}

function handleDashboardSearchInputKeydown(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    handleDashboardSearch();
  }
}

function hydrateDashboardMetrics() {
  state.dashboardMetrics.totalQueries = 0;
  state.dashboardMetrics.queriesAvailable = null;
  state.dashboardMetrics.usersRegistered = null;
}

async function updateSidebarBoardStatus(board, nextStatus, triggerElement, menuElement, metaElement) {
  const normalizedStatus = String(nextStatus || "").trim().toLowerCase();
  if (!board || !["active", "closed"].includes(normalizedStatus)) {
    return;
  }

  const currentStatus = getBoardStatus(board).toLowerCase();
  if (normalizedStatus === currentStatus) {
    closeSidebarStatusMenus();
    return;
  }

  const previousValue = currentStatus;
  triggerElement.disabled = true;

  try {
    const payload = await apiRequest(`/api/boards?id=${encodeURIComponent(board.id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: board.name,
        description: board.description || "",
        iconEmoji: board.iconEmoji || DEFAULT_BOARD_DRAFT.iconEmoji,
        accentColor: board.accentColor || DEFAULT_BOARD_DRAFT.accentColor,
        status: normalizedStatus,
      }),
    });

    if (state.activeBoard?.id === board.id) {
      state.activeBoard = {
        ...state.activeBoard,
        ...payload.board,
      };
    }

    closeSidebarStatusMenus();
    await loadBoards();
    renderBoardWorkspace();
  } catch (error) {
    applySidebarStatusPresentation(triggerElement, menuElement, previousValue);
    if (metaElement) {
      metaElement.classList.toggle("active", previousValue === "active");
      metaElement.classList.toggle("closed", previousValue === "closed");
      metaElement.textContent = previousValue === "closed" ? "Closed Case File" : "Activate Case File";
    }
    alert(error.message || "Unable to update case status.");
  } finally {
    triggerElement.disabled = false;
  }
}

function closeSidebarStatusMenus(exceptMenu = null) {
  document.querySelectorAll(".sidebar-board-status-menu").forEach((menu) => {
    const trigger = menu.parentElement?.querySelector(".sidebar-board-status-trigger");
    const shouldKeepOpen = exceptMenu && menu === exceptMenu && menu.classList.contains("hidden");
    if (shouldKeepOpen) {
      return;
    }

    menu.classList.add("hidden");
    trigger?.classList.remove("is-open");
    trigger?.setAttribute("aria-expanded", "false");
  });
}

function applySidebarStatusPresentation(triggerElement, menuElement, statusValue) {
  const normalizedStatus = statusValue === "closed" ? "closed" : "active";
  if (triggerElement) {
    triggerElement.classList.toggle("active", normalizedStatus === "active");
    triggerElement.classList.toggle("closed", normalizedStatus === "closed");
    const label = triggerElement.querySelector("span");
    if (label) {
      label.textContent = normalizedStatus === "closed" ? "Closed" : "Active";
    }
  }

  menuElement?.querySelectorAll(".sidebar-board-status-option").forEach((option) => {
    option.classList.toggle("selected", option.dataset.status === normalizedStatus);
  });
}

function renderDashboardOverview() {
  elements.dashboardQueriesAvailable.textContent =
    formatMetricValue(state.dashboardMetrics.queriesAvailable);
  elements.dashboardUsersRegistered.textContent =
    formatMetricValue(state.dashboardMetrics.usersRegistered);
  elements.dashboardTotalQueries.textContent = formatMetricValue(state.dashboardMetrics.totalQueries || 0);
}

async function handleDashboardSearch() {
  const selectedType = String(elements.dashboardSearchType.value || "email").trim().toLowerCase();
  const type = selectedType === "person" ? "keyword" : selectedType;
  const query = String(elements.dashboardSearchInput.value || "").trim();

  if (!query) {
    showSearchFeedback("Enter a search query first.");
    return;
  }

  clearSearchFeedback();

  elements.dashboardSearchButton.disabled = true;
  elements.dashboardSearchButton.textContent = "Searching";

  try {
    const params = new URLSearchParams({
      query,
      type,
    });

    const payload = await apiRequest(`/api/search?${params.toString()}`);
    state.dashboardMetrics.queriesAvailable = parseMetricValue(payload?.quota);
    state.dashboardMetrics.usersRegistered = parseMetricValue(payload?.usersRegistered);
    state.dashboardMetrics.totalQueries = parseMetricValue(payload?.totalQueries) || 0;
    state.lastSearchSession = {
      payload,
      query,
      type: selectedType,
    };
    renderDashboardOverview();
    renderSearchResults(payload, query, selectedType);
  } catch (error) {
    showSearchFeedback(error.message || "Search failed.");
  } finally {
    elements.dashboardSearchButton.disabled = false;
    elements.dashboardSearchButton.textContent = "Search";
  }
}

function renderSearchResults(payload, query, type) {
  elements.searchResultsPanel.classList.remove("hidden");
  elements.searchResultsTitle.textContent = `${query} - ${getSearchTypeLabel(type)}`;
  elements.searchFoundBadge.textContent = `${Number(payload?.found || 0)} found - showing ${Number(payload?.returned || 0)}`;
  elements.searchQuotaBadge.textContent =
    `Daily Remaining ${formatMetricValue(parseMetricValue(payload?.quota))}`;
  elements.searchResultsList.innerHTML = "";

  const results = Array.isArray(payload?.result) ? payload.result : [];

  if (results.length === 0) {
    const empty = document.createElement("div");
    empty.className = "search-result-empty";
    empty.textContent = "No records matched that query.";
    elements.searchResultsList.appendChild(empty);
    return;
  }

  for (const result of results) {
    elements.searchResultsList.appendChild(createSearchResultCard(result, type, query));
  }
}

function createSearchResultCard(result, searchType, query) {
  const card = document.createElement("article");
  card.className = "search-result-card";

  const header = document.createElement("div");
  header.className = "search-result-header";

  const title = document.createElement("div");
  title.className = "search-result-title";
  title.innerHTML = `
    <strong>${escapeText(result.email || result.username || result.name || "Matched record")}</strong>
    <span>${escapeText(result.source?.name || "Search source")}</span>
  `;

  const meta = document.createElement("div");
  meta.className = "search-result-meta";
  meta.innerHTML = `
    <span>${escapeText(result.source?.breach_date || "Unknown date")}</span>
    <span>${result.source?.unverified ? "Unverified" : "Verified"}</span>
  `;

  header.append(title, meta);

  const fields = document.createElement("div");
  fields.className = "search-result-fields";

  for (const field of getVisibleResultFields(result)) {
    const item = document.createElement("div");
    item.className = "search-result-field";
    item.innerHTML = `
      <span>${escapeText(field.label)}</span>
      <strong>${escapeText(field.value)}</strong>
    `;
    fields.appendChild(item);
  }

  if (fields.children.length === 0) {
    const empty = document.createElement("div");
    empty.className = "search-result-empty";
    empty.textContent = "No additional fields returned for this record.";
    card.append(header, empty);
    appendSearchResultCaseAction(card, result, searchType, query);
    return card;
  }

  card.append(header, fields);
  appendSearchResultCaseAction(card, result, searchType, query);
  return card;
}

function appendSearchResultCaseAction(card, result, searchType, query) {
  if (!state.activeBoard?.id) {
    return;
  }

  const plan = buildSearchResultImportPlan(result, searchType, query);
  if (plan.nodeDrafts.length === 0) {
    return;
  }
  const matchSummary = getSearchResultCaseMatchSummary(plan, result);
  const alreadyImported = hasImportPlanInActiveCaseFile(plan);

  const panel = document.createElement("div");
  panel.className = "search-result-case-action";
  if (matchSummary.hasMatch && !alreadyImported) {
    panel.classList.add("is-match-found");
  }

  const copy = document.createElement("div");
  copy.className = "search-result-case-copy";
  const statusLabel = matchSummary.hasMatch && !alreadyImported ? "Match Found" : "Active Case File";
  const helperText = alreadyImported
    ? "This result is already connected to your case file."
    : matchSummary.hasMatch
      ? "We think we found a match to your case file. Would you like to add it?"
      : "Would you like to add this to your case file?";
  copy.innerHTML = `
    <span>${escapeText(statusLabel)}</span>
    <strong>${escapeText(`${state.activeBoard.iconEmoji || DEFAULT_BOARD_DRAFT.iconEmoji} ${state.activeBoard.name}`)}</strong>
    <p>${escapeText(helperText)}</p>
  `;

  if (matchSummary.hasMatch && !alreadyImported) {
    const matchMeta = document.createElement("div");
    matchMeta.className = "search-result-case-match-meta";
    matchMeta.textContent = `Matched ${matchSummary.labels.join(", ")}`;
    copy.appendChild(matchMeta);
  }

  const button = document.createElement("button");
  button.className = "button ghost search-result-case-button";
  button.type = "button";

  if (alreadyImported) {
    button.textContent = "Already in Case File";
    button.disabled = true;
  } else {
    button.textContent = "Add to Case File";
    button.addEventListener("click", () => handleAddSearchResultToCaseFile(result, searchType, query, button));
  }

  panel.append(copy, button);
  card.appendChild(panel);
}

function buildSearchResultNodeDraft(result, searchType, query) {
  const type = inferSearchResultNodeType(result, searchType);
  const label = inferSearchResultNodeLabel(result, type, query);
  const visibleFields = getVisibleResultFields(result)
    .filter((field) => field.value && String(field.value).trim().toLowerCase() !== label.trim().toLowerCase())
    .slice(0, 4);
  const notes = [
    `Imported from search for "${query}".`,
    result?.source?.name ? `Source: ${result.source.name}` : "",
    result?.source?.breach_date ? `Breach date: ${result.source.breach_date}` : "",
    ...visibleFields.map((field) => `${toDisplayLabel(field.label)}: ${field.value}`),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    type,
    label,
    metadata: {
      reference: [result?.source?.name, result?.source?.breach_date].filter(Boolean).join(" - "),
      notes,
    },
  };
}

function inferSearchResultNodeType(result, searchType) {
  if (["email", "username", "phone", "domain", "hash"].includes(searchType)) {
    return searchType === "hash" ? "hash" : searchType;
  }

  if (result?.name || result?.first_name || result?.last_name) {
    return "person";
  }

  if (result?.username) {
    return "username";
  }

  if (result?.email) {
    return "email";
  }

  if (result?.phone) {
    return "phone";
  }

  if (result?.ip) {
    return "ip";
  }

  return "note";
}

function inferSearchResultNodeLabel(result, type, query) {
  if (type === "person") {
    const fullName = [result?.first_name, result?.middle_name, result?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();
    return String(result?.name || fullName || query || "Matched person").trim();
  }

  const candidates = {
    email: result?.email,
    username: result?.username,
    phone: result?.phone,
    domain: result?.domain || result?.origin,
    hash: result?.hash || query,
    note: result?.email || result?.username || result?.name || query,
  };

  return String(candidates[type] || query || "Matched record").trim();
}

function hasMatchingNodeInActiveCaseFile(draft) {
  const label = String(draft.label || "").trim().toLowerCase();
  if (!label) {
    return false;
  }

  return state.nodes.some((node) => {
    return node.type === draft.type && String(node.label || "").trim().toLowerCase() === label;
  });
}

function buildSearchResultImportPlan(result, searchType, query) {
  const nodeDrafts = collectSearchResultEntityDrafts(result, searchType, query);
  if (nodeDrafts.length === 0) {
    return {
      nodeDrafts: [],
      edgeDrafts: [],
      primaryKey: "",
    };
  }

  const primaryDraft = selectPrimarySearchResultDraft(nodeDrafts, result, searchType, query);
  const edgeDrafts = nodeDrafts
    .filter((draft) => draft.key !== primaryDraft.key)
    .map((draft) => ({
      sourceKey: primaryDraft.key,
      targetKey: draft.key,
      label: inferSearchResultConnectionLabel(primaryDraft.type, draft.type),
    }));

  return {
    nodeDrafts,
    edgeDrafts,
    primaryKey: primaryDraft.key,
  };
}

function collectSearchResultEntityDrafts(result, searchType, query) {
  const reference = [result?.source?.name, result?.source?.breach_date].filter(Boolean).join(" - ");
  const visibleFields = getVisibleResultFields(result);
  const candidates = [
    { type: "person", label: buildSearchResultPersonLabel(result) },
    { type: "username", label: result?.username },
    { type: "email", label: result?.email },
    { type: "phone", label: result?.phone },
    { type: "ip", label: result?.ip },
    { type: "domain", label: result?.domain || result?.origin },
    { type: "hash", label: result?.hash },
  ];
  const drafts = [];
  const seen = new Set();

  for (const candidate of candidates) {
    const normalizedLabel = normalizeSearchResultEntityLabel(candidate.type, candidate.label);
    if (!normalizedLabel) {
      continue;
    }

    const key = `${candidate.type}:${normalizedLabel.toLowerCase()}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    drafts.push({
      key,
      type: candidate.type,
      label: normalizedLabel,
      metadata: {
        reference,
        notes: buildSearchResultEntityNotes(
          result,
          query,
          candidate.type,
          normalizedLabel,
          visibleFields,
        ),
      },
    });
  }

  if (drafts.length > 0) {
    return drafts;
  }

  const fallbackDraft = buildSearchResultNodeDraft(result, searchType, query);
  if (!fallbackDraft.label) {
    return [];
  }

  return [
    {
      key: `${fallbackDraft.type}:${String(fallbackDraft.label).toLowerCase()}`,
      ...fallbackDraft,
    },
  ];
}

function buildSearchResultPersonLabel(result) {
  const fullName = [result?.first_name, result?.middle_name, result?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return String(result?.name || fullName || "").trim();
}

function normalizeSearchResultEntityLabel(type, value) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return "";
  }

  if (type === "email" || type === "domain" || type === "username" || type === "hash") {
    return normalized.toLowerCase();
  }

  return normalized;
}

function buildSearchResultEntityNotes(result, query, focusType, focusLabel, visibleFields) {
  const relatedFields = visibleFields
    .filter((field) => {
      const normalizedValue = String(field.value || "").trim().toLowerCase();
      return normalizedValue && normalizedValue !== String(focusLabel || "").trim().toLowerCase();
    })
    .slice(0, 6);

  return [
    `Imported from search for "${query}".`,
    result?.source?.name ? `Source: ${result.source.name}` : "",
    result?.source?.breach_date ? `Breach date: ${result.source.breach_date}` : "",
    `Entity type: ${toDisplayLabel(focusType)}`,
    ...relatedFields.map((field) => `${toDisplayLabel(field.label)}: ${field.value}`),
  ]
    .filter(Boolean)
    .join("\n");
}

function selectPrimarySearchResultDraft(nodeDrafts, result, searchType, query) {
  const preferredType = inferSearchResultNodeType(result, searchType);
  const preferredLabel = inferSearchResultNodeLabel(result, preferredType, query).toLowerCase();
  const exactMatch = nodeDrafts.find((draft) => {
    return draft.type === preferredType && draft.label.toLowerCase() === preferredLabel;
  });

  if (exactMatch) {
    return exactMatch;
  }

  const typePriority = ["person", "username", "email", "phone", "ip", "domain", "hash", "note"];
  for (const type of typePriority) {
    const match = nodeDrafts.find((draft) => draft.type === type);
    if (match) {
      return match;
    }
  }

  return nodeDrafts[0];
}

function inferSearchResultConnectionLabel(sourceType, targetType) {
  if (sourceType === "person") {
    return "associated with";
  }

  if (sourceType === "username" && targetType === "email") {
    return "uses email";
  }

  if (sourceType === "username" && targetType === "ip") {
    return "seen from";
  }

  if (sourceType === "email" && targetType === "domain") {
    return "belongs to";
  }

  return "related to";
}

function findMatchingNodeInActiveCaseFile(draft) {
  const label = String(draft.label || "").trim().toLowerCase();
  if (!label) {
    return null;
  }

  return (
    state.nodes.find((node) => {
      return node.type === draft.type && String(node.label || "").trim().toLowerCase() === label;
    }) || null
  );
}

function makeEdgePairKey(leftNodeId, rightNodeId) {
  return [String(leftNodeId || ""), String(rightNodeId || "")].sort().join("::");
}

function hasImportPlanInActiveCaseFile(plan) {
  if (!plan?.nodeDrafts?.length) {
    return false;
  }

  const nodeMap = new Map();
  for (const draft of plan.nodeDrafts) {
    const node = findMatchingNodeInActiveCaseFile(draft);
    if (!node) {
      return false;
    }

    nodeMap.set(draft.key, node);
  }

  const existingPairs = new Set(
    state.edges.map((edge) => makeEdgePairKey(edge.sourceNodeId, edge.targetNodeId)),
  );

  return plan.edgeDrafts.every((edgeDraft) => {
    const sourceNode = nodeMap.get(edgeDraft.sourceKey);
    const targetNode = nodeMap.get(edgeDraft.targetKey);
    if (!sourceNode || !targetNode) {
      return false;
    }

    return existingPairs.has(makeEdgePairKey(sourceNode.id, targetNode.id));
  });
}

function getSearchResultCaseMatchSummary(plan, result) {
  if (!plan?.nodeDrafts?.length && !result) {
    return {
      hasMatch: false,
      labels: [],
    };
  }

  const labels = new Set();
  const matchedDrafts = (plan?.nodeDrafts || []).filter((draft) => findMatchingNodeInActiveCaseFile(draft));
  for (const draft of matchedDrafts) {
    labels.add(toDisplayLabel(draft.type));
  }

  const haystacks = getActiveCaseFileMatchHaystacks();
  for (const field of getSearchResultMatchFields(result)) {
    const normalizedLabel = normalizeSearchResultFieldLabel(field.label);
    const normalizedValue = normalizeSearchResultMatchValue(field.value);
    if (!isSearchResultFieldMatchCandidate(normalizedLabel, normalizedValue)) {
      continue;
    }

    if (haystacks.some((haystack) => haystack.includes(normalizedValue))) {
      labels.add(toDisplayLabel(normalizedLabel));
    }
  }

  const labelList = Array.from(labels);

  return {
    hasMatch: labelList.length > 0,
    labels: labelList,
  };
}

function getActiveCaseFileMatchHaystacks() {
  return state.nodes
    .map((node) => {
      return normalizeSearchResultMatchValue(
        [
          node?.label,
          node?.metadata?.reference,
          node?.metadata?.notes,
        ]
          .filter(Boolean)
          .join("\n"),
      );
    })
    .filter(Boolean);
}

function getSearchResultMatchFields(result) {
  return getVisibleResultFields(result, { limit: Number.POSITIVE_INFINITY });
}

function normalizeSearchResultFieldLabel(label) {
  return String(label || "")
    .trim()
    .replaceAll(" ", "_")
    .toLowerCase();
}

function normalizeSearchResultMatchValue(value) {
  return normalizeImportedDisplayText(String(value || ""))
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function isSearchResultFieldMatchCandidate(label, value) {
  if (!label || !value) {
    return false;
  }

  const allowedFields = new Set([
    "name",
    "first_name",
    "middle_name",
    "last_name",
    "username",
    "email",
    "phone",
    "ip",
    "address",
    "zip",
    "dob",
    "password",
    "domain",
    "hash",
  ]);
  if (!allowedFields.has(label)) {
    return false;
  }

  const minimumLengthByField = {
    first_name: 3,
    middle_name: 3,
    last_name: 3,
    username: 3,
    zip: 4,
    ip: 5,
    dob: 6,
    password: 3,
    hash: 6,
  };

  return value.length >= (minimumLengthByField[label] || 4);
}

function getSearchResultImportPosition(basePosition, index, total) {
  if (index === 0 || total <= 1) {
    return basePosition;
  }

  const radius = 220;
  const angleStep = (Math.PI * 2) / Math.max(total - 1, 1);
  const angle = angleStep * (index - 1);

  return {
    x: basePosition.x + Math.round(Math.cos(angle) * radius),
    y: basePosition.y + Math.round(Math.sin(angle) * radius),
  };
}

async function handleAddSearchResultToCaseFile(result, searchType, query, button) {
  if (!state.activeBoard?.id) {
    showSearchFeedback("Open a case file first, then try adding the match again.");
    return;
  }

  const plan = buildSearchResultImportPlan(result, searchType, query);
  if (plan.nodeDrafts.length === 0) {
    showSearchFeedback("This match does not include enough data to add to the case file.");
    return;
  }

  button.disabled = true;
  button.textContent = "Adding";

  try {
    const basePosition = getNewNodePosition();
    const importedNodes = new Map();
    const existingPairs = new Set(
      state.edges.map((edge) => makeEdgePairKey(edge.sourceNodeId, edge.targetNodeId)),
    );

    for (const [index, draft] of plan.nodeDrafts.entries()) {
      const existingNode = findMatchingNodeInActiveCaseFile(draft);
      if (existingNode) {
        importedNodes.set(draft.key, existingNode);
        continue;
      }

      const position = getSearchResultImportPosition(basePosition, index, plan.nodeDrafts.length);
      const payload = await apiRequest("/api/nodes", {
        method: "POST",
        body: JSON.stringify({
          boardId: state.activeBoard.id,
          ...draft,
          x: position.x,
          y: position.y,
        }),
      });
      importedNodes.set(draft.key, payload.node);
    }

    for (const edgeDraft of plan.edgeDrafts) {
      const sourceNode = importedNodes.get(edgeDraft.sourceKey);
      const targetNode = importedNodes.get(edgeDraft.targetKey);
      if (!sourceNode || !targetNode) {
        continue;
      }

      const pairKey = makeEdgePairKey(sourceNode.id, targetNode.id);
      if (existingPairs.has(pairKey)) {
        continue;
      }

      await apiRequest("/api/edges", {
        method: "POST",
        body: JSON.stringify({
          boardId: state.activeBoard.id,
          sourceNodeId: sourceNode.id,
          targetNodeId: targetNode.id,
          label: edgeDraft.label,
          metadata: {},
        }),
      });
      existingPairs.add(pairKey);
    }

    await refreshActiveBoard();
    clearSearchFeedback();
    rerenderSearchResultsFromState();
  } catch (error) {
    button.disabled = false;
    button.textContent = "Add to Case File";
    showSearchFeedback(error.message || "Unable to add that match to the case file.");
  }
}

function rerenderSearchResultsFromState() {
  if (!state.lastSearchSession?.payload) {
    return;
  }

  renderSearchResults(
    state.lastSearchSession.payload,
    state.lastSearchSession.query,
    state.lastSearchSession.type,
  );
}

async function syncDashboardMetrics() {
  try {
    const payload = await apiRequest("/api/dashboard-metrics");
    state.dashboardMetrics.queriesAvailable = parseMetricValue(payload?.quota);
    state.dashboardMetrics.usersRegistered = parseMetricValue(payload?.usersRegistered);
    state.dashboardMetrics.totalQueries = parseMetricValue(payload?.totalQueries) || 0;
    renderDashboardOverview();
  } catch (error) {
    console.error("Unable to sync dashboard metrics.", error);
  }
}

function loadAppSettings() {
  try {
    const rawValue = window.localStorage.getItem(APP_SETTINGS_STORAGE_KEY);
    if (!rawValue) {
      return { ...DEFAULT_APP_SETTINGS };
    }

    const parsedValue = JSON.parse(rawValue);
    return {
      ...DEFAULT_APP_SETTINGS,
      ...parsedValue,
    };
  } catch {
    return { ...DEFAULT_APP_SETTINGS };
  }
}

function persistAppSettings() {
  try {
    window.localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(state.appSettings));
  } catch {}
}

function safeLocalStorageGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function getVisibleResultFields(result, options = {}) {
  const parsedLimit = Number(options.limit);
  const limit = options.limit === Number.POSITIVE_INFINITY || parsedLimit === Number.POSITIVE_INFINITY
    ? Number.POSITIVE_INFINITY
    : Number.isFinite(parsedLimit)
      ? parsedLimit
      : 6;
  const preferredOrder = [
    "name",
    "first_name",
    "last_name",
    "middle_name",
    "username",
    "email",
    "phone",
    "ip",
    "address",
    "city",
    "state",
    "zip",
    "country",
    "dob",
    "domain",
    "hash",
    "origin",
    "password",
  ];
  const fields = [];
  const seen = new Set();

  for (const key of preferredOrder) {
    const value = result?.[key];
    if (!value || key === "source" || key === "fields") {
      continue;
    }

    const normalizedValue = Array.isArray(value) ? value.join(", ") : String(value);
    const signature = `${key}:${normalizedValue}`;
    if (seen.has(signature)) {
      continue;
    }

    seen.add(signature);
    fields.push({
      label: key.replaceAll("_", " "),
      value: normalizedValue,
    });

    if (fields.length >= limit) {
      break;
    }
  }

  return fields;
}

function showSearchFeedback(message) {
  elements.searchFeedback.textContent = message;
  elements.searchFeedback.classList.remove("hidden");
}

function clearSearchFeedback() {
  elements.searchFeedback.textContent = "";
  elements.searchFeedback.classList.add("hidden");
}

function showBoard() {
  if (!state.activeBoard) {
    showHomeView();
    return;
  }

  elements.dashboardView.classList.add("hidden");
  elements.userSearchView.classList.add("hidden");
  elements.boardsView.classList.add("hidden");
  elements.boardView.classList.remove("hidden");
  syncBoardCreateButtons("board-view");
  elements.topbarAddNodeButton.classList.add("hidden");
  elements.topbarCopy.classList.add("hidden");
  elements.viewEyebrow.classList.add("hidden");
  elements.viewSubtitle.classList.add("hidden");
  elements.viewEyebrow.textContent = "";
  elements.viewTitle.textContent = `${state.activeBoard.iconEmoji || DEFAULT_BOARD_DRAFT.iconEmoji} ${state.activeBoard.name}`;
  elements.viewSubtitle.textContent = "";
  setActiveNav(state.dashboardSection);
  document.documentElement.style.setProperty("--board-accent", state.activeBoard.accentColor || "#63b6ff");
  renderBoardWorkspace();
}

function renderBoardWorkspace() {
  applyCanvasZoom();
  renderNodes();
  renderInspector();
  scheduleEdgeRender();
}

function adjustCanvasZoom(delta) {
  setCanvasZoom(state.canvasZoom + delta);
}

function setCanvasZoom(nextZoom, options = {}) {
  const targetZoom = clampFloat(nextZoom, MIN_CANVAS_ZOOM, MAX_CANVAS_ZOOM);
  const currentZoom = state.canvasZoom || 1;
  if (Math.abs(targetZoom - currentZoom) < 0.001) {
    applyCanvasZoom();
    return;
  }

  const scroller = elements.canvasScroller;
  const focusPoint = getCanvasFocusPoint();
  const viewportCenterX =
    options.viewportX ??
    (focusPoint
      ? focusPoint.x * currentZoom
      : scroller.scrollLeft + scroller.clientWidth / 2);
  const viewportCenterY =
    options.viewportY ??
    (focusPoint
      ? focusPoint.y * currentZoom
      : scroller.scrollTop + scroller.clientHeight / 2);
  const contentX = viewportCenterX / currentZoom;
  const contentY = viewportCenterY / currentZoom;

  state.canvasZoom = targetZoom;
  applyCanvasZoom();

  scroller.scrollLeft = Math.max(0, contentX * targetZoom - scroller.clientWidth / 2);
  scroller.scrollTop = Math.max(0, contentY * targetZoom - scroller.clientHeight / 2);
}

function applyCanvasZoom() {
  const zoom = state.canvasZoom || 1;
  const surfaceWidth = Math.round(BASE_CANVAS_WIDTH * zoom);
  const surfaceHeight = Math.round(BASE_CANVAS_HEIGHT * zoom);
  elements.graphPanSurface.style.width = `${surfaceWidth}px`;
  elements.graphPanSurface.style.height = `${surfaceHeight}px`;
  elements.graphCanvas.style.transform = `scale(${zoom})`;
  elements.graphCanvas.style.transformOrigin = "top left";
  elements.graphCanvas.style.left = "0";
  elements.graphCanvas.style.top = "0";
  elements.canvasZoomValue.textContent = `${Math.round(zoom * 100)}%`;

  if (state.shouldCenterCanvas) {
    requestAnimationFrame(() => {
      centerCanvasViewport();
      state.shouldCenterCanvas = false;
    });
  }
}

function handleCanvasWheel(event) {
  if (!event.ctrlKey && !event.metaKey) {
    return;
  }

  event.preventDefault();
  const scrollerRect = elements.canvasScroller.getBoundingClientRect();
  const delta = event.deltaY < 0 ? CANVAS_ZOOM_STEP : -CANVAS_ZOOM_STEP;
  setCanvasZoom(state.canvasZoom + delta, {
    viewportX: elements.canvasScroller.scrollLeft + (event.clientX - scrollerRect.left),
    viewportY: elements.canvasScroller.scrollTop + (event.clientY - scrollerRect.top),
  });
}

function getCanvasFocusPoint() {
  if (state.selectedNodeId) {
    const selectedNode = state.nodes.find((node) => node.id === state.selectedNodeId);
    if (selectedNode) {
      const limits = getNodeResizeLimits(selectedNode.type, selectedNode);
      const width = clamp(
        toNumber(selectedNode.metadata.width, selectedNode.type === "person" ? 260 : 230),
        limits.minWidth,
        limits.maxWidth,
      );
      const height = clamp(
        toNumber(selectedNode.metadata.height, selectedNode.type === "person" ? 250 : 160),
        limits.minHeight,
        limits.maxHeight,
      );

      return {
        x: selectedNode.x + width / 2,
        y: selectedNode.y + height / 2,
      };
    }
  }

  if (!state.nodes.length) {
    return null;
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of state.nodes) {
    const limits = getNodeResizeLimits(node.type, node);
    const width = clamp(
      toNumber(node.metadata.width, node.type === "person" ? 260 : 230),
      limits.minWidth,
      limits.maxWidth,
    );
    const height = clamp(
      toNumber(node.metadata.height, node.type === "person" ? 250 : 160),
      limits.minHeight,
      limits.maxHeight,
    );
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + width);
    maxY = Math.max(maxY, node.y + height);
  }

  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
  };
}

function centerCanvasViewport() {
  const focusPoint = getCanvasFocusPoint();
  if (focusPoint) {
    elements.canvasScroller.scrollLeft = Math.max(
      0,
      focusPoint.x * state.canvasZoom - elements.canvasScroller.clientWidth / 2,
    );
    elements.canvasScroller.scrollTop = Math.max(
      0,
      focusPoint.y * state.canvasZoom - elements.canvasScroller.clientHeight / 2,
    );
    return;
  }

  elements.canvasScroller.scrollLeft = 0;
  elements.canvasScroller.scrollTop = 0;
}

function renderBoardCustomOptions() {
  elements.boardEmojiGrid.innerHTML = "";
  elements.boardColorGrid.innerHTML = "";

  for (const emoji of BOARD_EMOJI_PRESETS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "emoji-preset";
    button.dataset.emoji = emoji;
    button.textContent = emoji;
    button.addEventListener("click", () => setBoardEmoji(emoji));
    elements.boardEmojiGrid.appendChild(button);
  }

  for (const color of BOARD_COLOR_PRESETS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "color-preset";
    button.dataset.color = color;
    button.style.background = color;
    button.addEventListener("click", () => setBoardColor(color));
    elements.boardColorGrid.appendChild(button);
  }

  updateBoardDraftSelectionStates();
  updateBoardDraftPreview();
}

function renderNodes() {
  elements.graphNodes.innerHTML = "";

  for (const node of state.nodes) {
    const element = document.createElement("article");
    element.className = `graph-node type-${node.type}`;
    if (node.id === state.selectedNodeId) {
      element.classList.add("selected");
    }
    if (node.id === state.linkSourceId) {
      element.classList.add("link-source");
    }

    element.dataset.id = node.id;
    element.style.left = `${node.x}px`;
    element.style.top = `${node.y}px`;
    applyNodeSize(element, node);
    element.appendChild(createNodeCardContent(node));

    const resizeHandle = document.createElement("button");
    resizeHandle.className = "node-resize-handle";
    resizeHandle.type = "button";
    resizeHandle.setAttribute("aria-label", `Resize ${node.label}`);
    resizeHandle.addEventListener("pointerdown", (event) => beginResize(event, node.id));
    element.appendChild(resizeHandle);

    element.addEventListener("click", (event) => {
      event.stopPropagation();
      handleNodeClick(node.id);
    });

    element.addEventListener("dblclick", (event) => {
      event.stopPropagation();
      openNodeModal(node);
    });

    element.addEventListener("pointerdown", (event) => beginDrag(event, node.id));
    elements.graphNodes.appendChild(element);
  }
}

function renderEdges() {
  elements.graphEdges.innerHTML = "";
  elements.graphEdges.setAttribute("viewBox", `0 0 ${elements.graphCanvas.clientWidth} ${elements.graphCanvas.clientHeight}`);

  for (const edge of state.edges) {
    const sourceElement = getNodeElement(edge.sourceNodeId);
    const targetElement = getNodeElement(edge.targetNodeId);
    if (!sourceElement || !targetElement) {
      continue;
    }

    const source = getNodeCenter(sourceElement);
    const target = getNodeCenter(targetElement);

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("class", "graph-edge");
    line.setAttribute("x1", source.x);
    line.setAttribute("y1", source.y);
    line.setAttribute("x2", target.x);
    line.setAttribute("y2", target.y);
    elements.graphEdges.appendChild(line);

    if (edge.label) {
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("class", "graph-edge-label");
      text.setAttribute("x", String((source.x + target.x) / 2));
      text.setAttribute("y", String((source.y + target.y) / 2 - 8));
      text.setAttribute("text-anchor", "middle");
      text.textContent = edge.label;
      elements.graphEdges.appendChild(text);
    }
  }
}

function scheduleEdgeRender() {
  if (state.edgeFrame) {
    cancelAnimationFrame(state.edgeFrame);
  }

  state.edgeFrame = requestAnimationFrame(() => {
    renderEdges();
    state.edgeFrame = null;
  });
}

function renderInspector() {
  elements.inspector.innerHTML = "";

  if (!state.activeBoard) {
    return;
  }

  if (!state.selectedNodeId) {
    const container = document.createElement("div");
    container.className = "inspector-stack";

    const title = document.createElement("div");
    title.innerHTML = `
      <p class="eyebrow">CASE FILE</p>
      <h3>${escapeText(`${state.activeBoard.iconEmoji || DEFAULT_BOARD_DRAFT.iconEmoji} ${state.activeBoard.name}`)}</h3>
    `;

    const note = document.createElement("p");
    note.className = "inspector-note";
    note.textContent =
      state.activeBoard.description || "No board description yet. Add nodes to begin mapping signals.";

    const actions = document.createElement("div");
    actions.className = "inspector-actions";

    const addNodeButton = document.createElement("button");
    addNodeButton.className = "button primary block";
    addNodeButton.type = "button";
    addNodeButton.textContent = state.nodes.length > 0 ? "Add Node" : "Add First Node";
    addNodeButton.addEventListener("click", () => openNodeModal());

    actions.appendChild(addNodeButton);
    container.append(title, note, actions);
    elements.inspector.appendChild(container);
    return;
  }

  const node = state.nodes.find((item) => item.id === state.selectedNodeId);
  if (!node) {
    return;
  }

  const connections = state.edges.filter(
    (edge) => edge.sourceNodeId === node.id || edge.targetNodeId === node.id,
  );

  const container = document.createElement("div");
  container.className = "inspector-stack";

  const header = document.createElement("div");
  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = "Active";
  const title = document.createElement("h3");
  title.textContent = node.label;
  header.append(eyebrow, title);

  const actions = document.createElement("div");
  actions.className = "inspector-actions";

  const editButton = document.createElement("button");
  editButton.className = "button ghost block";
  editButton.type = "button";
  editButton.textContent = "Edit Node";
  editButton.addEventListener("click", () => openNodeModal(node));

  const linkButton = document.createElement("button");
  linkButton.className = "button ghost block";
  linkButton.type = "button";
  linkButton.textContent = state.linkSourceId === node.id ? "Cancel Link" : "Link From Node";
  linkButton.addEventListener("click", () => {
    if (state.linkSourceId === node.id) {
      state.linkSourceId = null;
      renderBoardWorkspace();
      return;
    }

    state.linkSourceId = node.id;
    renderBoardWorkspace();
  });

  const deleteButton = document.createElement("button");
  deleteButton.className = "button block";
  deleteButton.type = "button";
  deleteButton.textContent = "Delete Node";
  deleteButton.addEventListener("click", () => handleDeleteNode(node.id));

  actions.append(editButton, linkButton, deleteButton);

  container.append(header, actions);
  container.appendChild(renderInspectorBlock("Type", getNodeTypeLabel(node.type)));
  container.appendChild(renderInspectorBlock("Reference", node.metadata.reference || "None"));
  container.appendChild(renderInspectorBlock("Notes", node.metadata.notes || "No notes added."));

  const connectionsBlock = document.createElement("div");
  connectionsBlock.className = "inspector-block";

  const connectionsLabel = document.createElement("div");
  connectionsLabel.className = "inspector-label";
  connectionsLabel.textContent = "Connections";
  connectionsBlock.appendChild(connectionsLabel);

  if (connections.length === 0) {
    const empty = document.createElement("p");
    empty.className = "inspector-note";
    empty.textContent = "This node is not linked yet.";
    connectionsBlock.appendChild(empty);
  } else {
    const list = document.createElement("div");
    list.className = "inspector-connections";

    for (const edge of connections) {
      const relatedNodeId = edge.sourceNodeId === node.id ? edge.targetNodeId : edge.sourceNodeId;
      const relatedNode = state.nodes.find((item) => item.id === relatedNodeId);

      const item = document.createElement("div");
      item.className = "connection-item";

      const itemHeader = document.createElement("div");
      itemHeader.className = "connection-item-header";

      const name = document.createElement("div");
      name.className = "connection-name";
      name.textContent = relatedNode ? relatedNode.label : "Unknown node";

      const remove = document.createElement("button");
      remove.className = "button ghost";
      remove.type = "button";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => handleDeleteEdge(edge.id));

      itemHeader.append(name, remove);

      const meta = document.createElement("p");
      meta.className = "connection-meta";
      meta.textContent = edge.label || "Unlabeled relationship";

      item.append(itemHeader, meta);
      list.appendChild(item);
    }

    connectionsBlock.appendChild(list);
  }

  container.appendChild(connectionsBlock);
  elements.inspector.appendChild(container);
}

function renderInspectorBlock(labelText, valueText) {
  const block = document.createElement("div");
  block.className = "inspector-block";

  const label = document.createElement("div");
  label.className = "inspector-label";
  label.textContent = labelText;

  const value = document.createElement("div");
  value.className = "inspector-value";
  value.textContent = normalizeImportedDisplayText(valueText);

  block.append(label, value);
  return block;
}

function openNodeModal(node = null) {
  if (!state.activeBoard) {
    return;
  }

  elements.nodeForm.reset();
  elements.personPhotoInput.value = "";
  state.nodeDraftProfileImage = node?.metadata.profileImage || "";
  elements.nodeModalEyebrow.textContent = node ? "Edit Signal" : "Create Signal";
  elements.nodeModalTitle.textContent = node ? "Edit Investigation Signal" : "Create Investigation Signal";
  elements.nodeModalCopy.textContent = node
    ? "Refine the signal details, update the primary identifier, or add more context."
    : "Choose a signal type, add the primary identifier, and pin it to the board.";
  elements.nodeSubmitButton.textContent = node ? "Update Signal" : "Create Signal";
  elements.nodeForm.elements.nodeId.value = node?.id || "";

  const type = node?.type || "email";
  setSelectedNodeType(type);
  elements.nodeForm.elements.label.value = node?.label || "";
  elements.nodeForm.elements.reference.value = node?.metadata.reference || "";
  elements.nodeForm.elements.notes.value = node?.metadata.notes || "";
  elements.nodeProfileImageData.value = state.nodeDraftProfileImage;
  updatePersonPhotoPreview();
  openModal("nodeModal");
}

function renderTypeDropdown() {
  elements.nodeTypeMenu.innerHTML = "";

  for (const type of NODE_TYPES) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "node-type-option";
    button.dataset.type = type.value;
    button.innerHTML = `
      <span class="node-type-option-icon"><i class="fa-solid ${type.faIcon}"></i></span>
      <span class="node-type-option-copy">
        <strong>${type.label}</strong>
      </span>
    `;
    button.addEventListener("click", () => {
      setSelectedNodeType(type.value);
      closeNodeTypeMenu();
    });
    elements.nodeTypeMenu.appendChild(button);
  }

  setSelectedNodeType("email");
}

function setSelectedNodeType(type) {
  elements.nodeTypeMenu.querySelectorAll(".node-type-option").forEach((button) => {
    button.classList.toggle("selected", button.dataset.type === type);
  });
  elements.nodeTypeMenu.dataset.selectedType = type;
  updateNodeTypePreview(type);
}

function updateNodeTypePreview(type) {
  const config = NODE_TYPES.find((item) => item.value === type) || NODE_TYPES[0];
  elements.nodeTypeTriggerIcon.innerHTML = `<i class="fa-solid ${config.faIcon}"></i>`;
  elements.nodeTypeTriggerLabel.textContent = config.label;
  elements.nodeLabelFieldLabel.textContent = config.label;
  elements.nodeLabelInput.placeholder = config.placeholder;
  elements.personMediaPanel.classList.toggle("hidden", type !== "person");
  updatePersonPhotoPreview();
}

async function handleNodeSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const nodeId = String(formData.get("nodeId") || "");
  const selectedType = elements.nodeTypeMenu.dataset.selectedType || "email";
  const existingNode = state.nodes.find((node) => node.id === nodeId);
  const payload = {
    type: selectedType,
    label: String(formData.get("label") || "").trim(),
    metadata: {
      width: String(existingNode?.metadata.width || ""),
      height: String(existingNode?.metadata.height || ""),
      reference: String(formData.get("reference") || "").trim(),
      notes: String(formData.get("notes") || "").trim(),
    },
  };

  if (selectedType === "person" && state.nodeDraftProfileImage) {
    payload.metadata.profileImage = state.nodeDraftProfileImage;
  }

  if (!payload.label) {
    alert("Node label is required.");
    return;
  }

  if (nodeId) {
    await apiRequest(`/api/nodes?id=${encodeURIComponent(nodeId)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  } else {
    const position = getNewNodePosition();
    await apiRequest("/api/nodes", {
      method: "POST",
      body: JSON.stringify({
        boardId: state.activeBoard.id,
        ...payload,
        x: position.x,
        y: position.y,
      }),
    });
  }

  closeModal("nodeModal");
  await refreshActiveBoard();
}

function getNewNodePosition() {
  const offset = state.nodes.length * 18;
  return {
    x: 220 + offset % 280,
    y: 180 + offset % 220,
  };
}

function handleCanvasClick(event) {
  if (Date.now() - state.justPannedAt < 120) {
    return;
  }

  if (
    event.target !== elements.graphCanvas &&
    event.target !== elements.graphNodes &&
    event.target !== elements.graphPanSurface
  ) {
    return;
  }

  state.selectedNodeId = null;
  renderBoardWorkspace();
}

function toggleNodeTypeMenu() {
  const isOpen = !elements.nodeTypeMenu.classList.contains("hidden");
  if (isOpen) {
    closeNodeTypeMenu();
    return;
  }

  elements.nodeTypeMenu.classList.remove("hidden");
  elements.nodeTypeTrigger.classList.add("is-open");
  elements.nodeTypeTrigger.setAttribute("aria-expanded", "true");
}

function toggleSearchTypeMenu() {
  const isOpen = !elements.dashboardSearchTypeMenu.classList.contains("hidden");
  if (isOpen) {
    closeSearchTypeMenu();
    return;
  }

  elements.dashboardSearchTypeMenu.classList.remove("hidden");
  elements.dashboardSearchTypeTrigger.classList.add("is-open");
  elements.dashboardSearchTypeTrigger.setAttribute("aria-expanded", "true");
}

function closeSearchTypeMenu() {
  elements.dashboardSearchTypeMenu.classList.add("hidden");
  elements.dashboardSearchTypeTrigger.classList.remove("is-open");
  elements.dashboardSearchTypeTrigger.setAttribute("aria-expanded", "false");
}

function closeNodeTypeMenu() {
  elements.nodeTypeMenu.classList.add("hidden");
  elements.nodeTypeTrigger.classList.remove("is-open");
  elements.nodeTypeTrigger.setAttribute("aria-expanded", "false");
}

function handleDocumentClick(event) {
  if (!event.target.closest(".sidebar-board-status-wrap")) {
    closeSidebarStatusMenus();
  }

  if (!elements.dashboardSearchTypeSelect.contains(event.target)) {
    closeSearchTypeMenu();
  }

  if (!elements.nodeTypeSelect.contains(event.target)) {
    closeNodeTypeMenu();
  }
}

function handleDocumentKeydown(event) {
  if (event.key === "Escape") {
    if (!document.getElementById("deleteBoardModal").classList.contains("hidden")) {
      closeDeleteBoardModal();
      return;
    }

    closeSidebarStatusMenus();
    closeSidebar();
    closeSearchTypeMenu();
    closeNodeTypeMenu();
  }
}

async function handlePersonPhotoChange(event) {
  const [file] = Array.from(event.target.files || []);
  if (!file) {
    return;
  }

  try {
    state.nodeDraftProfileImage = await readImageAsDataUrl(file);
    elements.nodeProfileImageData.value = state.nodeDraftProfileImage;
    updatePersonPhotoPreview();
  } catch (error) {
    alert(error.message || "Unable to process that image.");
    event.target.value = "";
  }
}

function clearPersonPhoto() {
  state.nodeDraftProfileImage = "";
  elements.nodeProfileImageData.value = "";
  elements.personPhotoInput.value = "";
  updatePersonPhotoPreview();
}

function handleBoardEmojiInput(event) {
  setBoardEmoji(String(event.target.value || "").trim() || DEFAULT_BOARD_DRAFT.iconEmoji);
}

function handleBoardColorInput(event) {
  setBoardColor(String(event.target.value || DEFAULT_BOARD_DRAFT.accentColor));
}

function handleBoardStatusToggleClick(event) {
  const button = event.target.closest("[data-status]");
  if (!button) {
    return;
  }

  setBoardStatus(button.dataset.status);
}

function handleNodeClick(nodeId) {
  if (state.linkSourceId && state.linkSourceId !== nodeId) {
    createEdgeFromSelection(state.linkSourceId, nodeId);
    return;
  }

  if (state.linkSourceId === nodeId) {
    state.linkSourceId = null;
  }

  state.selectedNodeId = nodeId;
  renderBoardWorkspace();
}

function toggleLinkMode() {
  if (!state.selectedNodeId) {
    alert("Select a node first, then start link mode.");
    return;
  }

  state.linkSourceId = state.linkSourceId ? null : state.selectedNodeId;
  renderBoardWorkspace();
}

async function createEdgeFromSelection(sourceNodeId, targetNodeId) {
  const label = await openRelationshipModal(sourceNodeId, targetNodeId);
  if (label === null) {
    return;
  }

  try {
    await apiRequest("/api/edges", {
      method: "POST",
      body: JSON.stringify({
        boardId: state.activeBoard.id,
        sourceNodeId,
        targetNodeId,
        label,
        metadata: {},
      }),
    });
    state.linkSourceId = null;
    state.selectedNodeId = targetNodeId;
    await refreshActiveBoard();
  } catch (error) {
    alert(error.message);
  }
}

function openRelationshipModal(sourceNodeId, targetNodeId) {
  const sourceNode = state.nodes.find((item) => item.id === sourceNodeId);
  const targetNode = state.nodes.find((item) => item.id === targetNodeId);

  if (!sourceNode || !targetNode) {
    return Promise.resolve(null);
  }

  elements.relationshipSourceMeta.textContent = `SOURCE - ${getNodeTypeCode(sourceNode.type)}`;
  elements.relationshipSourceLabel.textContent = sourceNode.label;
  elements.relationshipSourceType.textContent = getNodeTypeLabel(sourceNode.type);
  elements.relationshipTargetMeta.textContent = `TARGET - ${getNodeTypeCode(targetNode.type)}`;
  elements.relationshipTargetLabel.textContent = targetNode.label;
  elements.relationshipTargetType.textContent = getNodeTypeLabel(targetNode.type);
  elements.relationshipLabelInput.value = "related to";

  openModal("relationshipModal");
  requestAnimationFrame(() => {
    elements.relationshipLabelInput.focus();
    elements.relationshipLabelInput.select();
  });

  return new Promise((resolve) => {
    state.pendingRelationship = {
      sourceNodeId,
      targetNodeId,
      resolve,
    };
  });
}

function closeRelationshipModal() {
  if (!state.pendingRelationship) {
    closeModal("relationshipModal");
    return;
  }

  const { resolve } = state.pendingRelationship;
  state.pendingRelationship = null;
  closeModal("relationshipModal");
  resolve(null);
}

function handleRelationshipSuggestionClick(event) {
  const button = event.target.closest("[data-label]");
  if (!button) {
    return;
  }

  elements.relationshipLabelInput.value = button.dataset.label || "";
  elements.relationshipLabelInput.focus();
  elements.relationshipLabelInput.select();
}

function handleRelationshipSubmit(event) {
  event.preventDefault();

  if (!state.pendingRelationship) {
    closeModal("relationshipModal");
    return;
  }

  const label = String(elements.relationshipLabelInput.value || "").trim();
  const { resolve } = state.pendingRelationship;
  state.pendingRelationship = null;
  closeModal("relationshipModal");
  resolve(label);
}

function beginDrag(event, nodeId) {
  if (event.button !== 0) {
    return;
  }

  const nodeElement = getNodeElement(nodeId);
  if (!nodeElement) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  const node = state.nodes.find((item) => item.id === nodeId);
  const canvasRect = elements.graphCanvas.getBoundingClientRect();
  const zoom = state.canvasZoom || 1;
  const pointerOffsetX = (event.clientX - canvasRect.left) / zoom - node.x;
  const pointerOffsetY = (event.clientY - canvasRect.top) / zoom - node.y;

  state.drag = {
    id: nodeId,
    pointerOffsetX,
    pointerOffsetY,
  };

  nodeElement.classList.add("dragging");
  window.addEventListener("pointermove", handleDragMove);
  window.addEventListener("pointerup", handleDragEnd, { once: true });
}

function beginCanvasPan(event) {
  if (event.button !== 0) {
    return;
  }

  if (state.drag || state.resize) {
    return;
  }

  if (event.target.closest(".canvas-toolbar")) {
    return;
  }

  if (event.target.closest(".graph-node") || event.target.closest(".node-resize-handle")) {
    return;
  }

  event.preventDefault();

  state.pan = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startScrollLeft: elements.canvasScroller.scrollLeft,
    startScrollTop: elements.canvasScroller.scrollTop,
    moved: false,
  };

  elements.canvasScroller.setPointerCapture?.(event.pointerId);
  elements.canvasScroller.classList.add("is-panning");
  window.addEventListener("pointermove", handleCanvasPanMove);
  window.addEventListener("pointerup", handleCanvasPanEnd, { once: true });
}

function beginResize(event, nodeId) {
  if (event.button !== 0) {
    return;
  }

  const nodeElement = getNodeElement(nodeId);
  const node = state.nodes.find((item) => item.id === nodeId);
  if (!nodeElement || !node) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  state.resize = {
    id: nodeId,
    startWidth: nodeElement.offsetWidth,
    startHeight: nodeElement.offsetHeight,
    startX: event.clientX,
    startY: event.clientY,
    zoom: state.canvasZoom || 1,
  };

  nodeElement.classList.add("resizing");
  window.addEventListener("pointermove", handleResizeMove);
  window.addEventListener("pointerup", handleResizeEnd, { once: true });
}

function handleDragMove(event) {
  if (!state.drag) {
    return;
  }

  const node = state.nodes.find((item) => item.id === state.drag.id);
  const canvasRect = elements.graphCanvas.getBoundingClientRect();
  const nodeElement = getNodeElement(node.id);
  if (!node || !nodeElement) {
    return;
  }

  const nextX = clamp(
    (event.clientX - canvasRect.left) / (state.canvasZoom || 1) - state.drag.pointerOffsetX,
    32,
    elements.graphCanvas.clientWidth - nodeElement.offsetWidth - 32,
  );
  const nextY = clamp(
    (event.clientY - canvasRect.top) / (state.canvasZoom || 1) - state.drag.pointerOffsetY,
    32,
    elements.graphCanvas.clientHeight - nodeElement.offsetHeight - 32,
  );

  node.x = nextX;
  node.y = nextY;
  nodeElement.style.left = `${nextX}px`;
  nodeElement.style.top = `${nextY}px`;
  scheduleEdgeRender();
  renderInspector();
}

async function handleDragEnd() {
  if (!state.drag) {
    return;
  }

  const nodeId = state.drag.id;
  const node = state.nodes.find((item) => item.id === nodeId);
  const nodeElement = getNodeElement(nodeId);

  state.drag = null;
  window.removeEventListener("pointermove", handleDragMove);
  nodeElement?.classList.remove("dragging");

  if (!node) {
    return;
  }

  try {
    await apiRequest(`/api/nodes?id=${encodeURIComponent(node.id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        x: node.x,
        y: node.y,
      }),
    });
    await refreshActiveBoard();
  } catch (error) {
    alert(error.message);
  }
}

function handleCanvasPanMove(event) {
  if (!state.pan) {
    return;
  }

  const deltaX = event.clientX - state.pan.startX;
  const deltaY = event.clientY - state.pan.startY;
  if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
    state.pan.moved = true;
  }

  elements.canvasScroller.scrollLeft = state.pan.startScrollLeft - deltaX;
  elements.canvasScroller.scrollTop = state.pan.startScrollTop - deltaY;
}

function handleCanvasPanEnd(event) {
  if (!state.pan) {
    return;
  }

  if (state.pan.moved) {
    state.justPannedAt = Date.now();
  }

  elements.canvasScroller.releasePointerCapture?.(state.pan.pointerId);
  state.pan = null;
  elements.canvasScroller.classList.remove("is-panning");
  window.removeEventListener("pointermove", handleCanvasPanMove);
}

function handleResizeMove(event) {
  if (!state.resize) {
    return;
  }

  const node = state.nodes.find((item) => item.id === state.resize.id);
  const nodeElement = getNodeElement(state.resize.id);
  if (!node || !nodeElement) {
    return;
  }

  const limits = getNodeResizeLimits(node.type, node);
  const nextWidth = clamp(
    state.resize.startWidth + (event.clientX - state.resize.startX) / state.resize.zoom,
    limits.minWidth,
    limits.maxWidth,
  );
  const nextHeight = clamp(
    state.resize.startHeight + (event.clientY - state.resize.startY) / state.resize.zoom,
    limits.minHeight,
    limits.maxHeight,
  );

  node.metadata.width = String(nextWidth);
  node.metadata.height = String(nextHeight);
  applyNodeSize(nodeElement, node);
  scheduleEdgeRender();
}

async function handleResizeEnd() {
  if (!state.resize) {
    return;
  }

  const nodeId = state.resize.id;
  const node = state.nodes.find((item) => item.id === nodeId);
  const nodeElement = getNodeElement(nodeId);

  state.resize = null;
  window.removeEventListener("pointermove", handleResizeMove);
  nodeElement?.classList.remove("resizing");

  if (!node) {
    return;
  }

  try {
    await apiRequest(`/api/nodes?id=${encodeURIComponent(node.id)}`, {
      method: "PATCH",
      body: JSON.stringify({
        metadata: {
          ...node.metadata,
          width: String(node.metadata.width || ""),
          height: String(node.metadata.height || ""),
        },
      }),
    });
    await refreshActiveBoard();
  } catch (error) {
    alert(error.message);
  }
}

async function handleDeleteNode(nodeId) {
  if (!window.confirm("Delete this node from the board?")) {
    return;
  }

  try {
    await apiRequest(`/api/nodes?id=${encodeURIComponent(nodeId)}`, {
      method: "DELETE",
    });
    state.selectedNodeId = null;
    await refreshActiveBoard();
  } catch (error) {
    alert(error.message);
  }
}

async function handleDeleteBoard(boardId, boardName) {
  const confirmed = await openDeleteBoardModal(boardName);
  if (!confirmed) {
    return;
  }

  try {
    await apiRequest(`/api/boards?id=${encodeURIComponent(boardId)}`, {
      method: "DELETE",
    });

    if (state.activeBoard?.id === boardId) {
      clearBoardRoute();
      showHomeView();
    }

    await loadBoards();
  } catch (error) {
    alert(error.message);
  }
}

function openDeleteBoardModal(boardName) {
  const safeBoardName = String(boardName || "this case file").trim() || "this case file";
  elements.deleteBoardMessage.textContent = `Delete case file "${safeBoardName}"? This removes the board, its nodes, and its relationships.`;
  openModal("deleteBoardModal");

  return new Promise((resolve) => {
    state.pendingBoardDeletion = { resolve };
  });
}

function closeDeleteBoardModal() {
  if (!state.pendingBoardDeletion) {
    closeModal("deleteBoardModal");
    return;
  }

  const { resolve } = state.pendingBoardDeletion;
  state.pendingBoardDeletion = null;
  closeModal("deleteBoardModal");
  resolve(false);
}

function confirmDeleteBoardModal() {
  if (!state.pendingBoardDeletion) {
    closeModal("deleteBoardModal");
    return;
  }

  const { resolve } = state.pendingBoardDeletion;
  state.pendingBoardDeletion = null;
  closeModal("deleteBoardModal");
  resolve(true);
}

async function handleDeleteEdge(edgeId) {
  try {
    await apiRequest(`/api/edges?id=${encodeURIComponent(edgeId)}`, {
      method: "DELETE",
    });
    await refreshActiveBoard();
  } catch (error) {
    alert(error.message);
  }
}

async function refreshActiveBoard() {
  if (!state.activeBoard) {
    return;
  }

  const payload = await apiRequest(`/api/boards?id=${encodeURIComponent(state.activeBoard.id)}`);
  state.activeBoard = payload.board;
  state.nodes = payload.nodes || [];
  state.edges = payload.edges || [];

  if (state.selectedNodeId && !state.nodes.some((node) => node.id === state.selectedNodeId)) {
    state.selectedNodeId = null;
  }

  if (state.linkSourceId && !state.nodes.some((node) => node.id === state.linkSourceId)) {
    state.linkSourceId = null;
  }

  await loadBoards();
  renderBoardWorkspace();
}

function setBoardEmoji(emoji) {
  state.boardDraft.iconEmoji = Array.from(String(emoji || DEFAULT_BOARD_DRAFT.iconEmoji)).slice(0, 4).join("") || DEFAULT_BOARD_DRAFT.iconEmoji;
  elements.boardEmojiInput.value = state.boardDraft.iconEmoji;
  updateBoardDraftSelectionStates();
  updateBoardDraftPreview();
}

function setBoardColor(color) {
  state.boardDraft.accentColor = normalizeBoardColor(color);
  elements.boardColorInput.value = state.boardDraft.accentColor;
  updateBoardDraftSelectionStates();
  updateBoardDraftPreview();
}

function setBoardStatus(status) {
  state.boardDraft.status = String(status || DEFAULT_BOARD_DRAFT.status);
  elements.boardStatusInput.value = state.boardDraft.status;
  updateBoardDraftSelectionStates();
  updateBoardDraftPreview();
}

function updateBoardDraftSelectionStates() {
  elements.boardEmojiGrid.querySelectorAll(".emoji-preset").forEach((button) => {
    button.classList.toggle("selected", button.dataset.emoji === state.boardDraft.iconEmoji);
  });

  elements.boardColorGrid.querySelectorAll(".color-preset").forEach((button) => {
    button.classList.toggle("selected", button.dataset.color === state.boardDraft.accentColor);
  });

  elements.boardStatusToggle.querySelectorAll(".status-toggle-button").forEach((button) => {
    const isSelected = button.dataset.status === state.boardDraft.status;
    button.classList.toggle("active", isSelected);
    button.setAttribute("aria-pressed", isSelected ? "true" : "false");
  });
}

function updateBoardDraftPreview() {
  const name = String(elements.boardForm.elements.name.value || "").trim() || "Untitled Board";
  const description =
    String(elements.boardForm.elements.description.value || "").trim() ||
    "Scope, goals, and notes will appear here.";

  elements.boardDraftIcon.textContent = state.boardDraft.iconEmoji;
  elements.boardDraftName.textContent = name;
  elements.boardDraftDescription.textContent = description;
  elements.boardDraftStatus.textContent = state.boardDraft.status.toUpperCase();
  elements.boardDraftStatus.className = `status-chip ${state.boardDraft.status}`;
  elements.boardDraftColorLabel.textContent = state.boardDraft.accentColor;
  elements.boardDraftPreview.style.setProperty("--preview-accent", state.boardDraft.accentColor);
}

function createNodeCardContent(node) {
  if (node.type === "person") {
    return createPersonNodeCard(node);
  }

  const wrapper = document.createElement("div");

  const top = document.createElement("div");
  top.className = "node-top";

  const badge = document.createElement("span");
  badge.className = "node-type";
  badge.innerHTML = `
    <span class="node-icon">${getNodeTypeIcon(node.type)}</span>
    <span>${getNodeTypeLabel(node.type)}</span>
  `;

  top.appendChild(badge);

  const title = document.createElement("h3");
  title.className = "node-title";
  title.textContent = node.label;

  const preview = document.createElement("p");
  preview.className = "node-preview";
  preview.textContent =
    normalizeImportedDisplayText(node.metadata.reference) ||
    normalizeImportedDisplayText(node.metadata.notes) ||
    "Click to inspect and edit.";

  wrapper.append(top, title, preview);
  return wrapper;
}

function createPersonNodeCard(node) {
  const wrapper = document.createElement("div");
  wrapper.className = "person-node-card";

  const identity = document.createElement("div");
  identity.className = "person-node-identity";

  const avatar = document.createElement("div");
  avatar.className = "person-node-avatar";

  if (node.metadata.profileImage) {
    const image = document.createElement("img");
    image.className = "person-node-avatar-image";
    image.src = node.metadata.profileImage;
    image.alt = `${node.label} profile`;
    image.draggable = false;
    avatar.appendChild(image);
  } else {
    const fallback = document.createElement("span");
    fallback.className = "person-node-avatar-fallback";
    fallback.textContent = getInitials(node.label);
    avatar.appendChild(fallback);
  }

  const copy = document.createElement("div");
  copy.className = "person-node-copy";

  const title = document.createElement("h3");
  title.className = "node-title";
  title.textContent = node.label;

  const subtitle = document.createElement("p");
  subtitle.className = "person-node-subtitle";
  subtitle.textContent = normalizeImportedDisplayText(node.metadata.reference) || "Person profile";

  const preview = document.createElement("p");
  preview.className = "node-preview";
  preview.textContent =
    normalizeImportedDisplayText(node.metadata.notes) || "Click to inspect and edit.";

  copy.append(title, subtitle, preview);
  identity.append(avatar, copy);
  wrapper.appendChild(identity);
  return wrapper;
}

function applyNodeSize(element, node) {
  const limits = getNodeResizeLimits(node.type, node);
  const width = clamp(
    toNumber(node.metadata.width, node.type === "person" ? 260 : 230),
    limits.minWidth,
    limits.maxWidth,
  );
  const height = clamp(
    toNumber(node.metadata.height, node.type === "person" ? 250 : 160),
    limits.minHeight,
    limits.maxHeight,
  );
  element.style.width = `${width}px`;
  element.style.minWidth = `${width}px`;
  element.style.minHeight = `${height}px`;
  if (node.type === "person") {
    element.style.setProperty(
      "--person-node-padding",
      `${clamp(width * 0.055, 6, 15)}px`,
    );
    element.style.setProperty(
      "--person-card-gap",
      `${clamp(width * 0.032, 4, 15)}px`,
    );
    element.style.setProperty(
      "--person-copy-gap",
      `${clamp(width * 0.015, 2, 6)}px`,
    );
    element.style.setProperty(
      "--person-avatar-radius",
      `${clamp(width * 0.07, 12, 20)}px`,
    );
    element.style.setProperty(
      "--person-title-size",
      `${clamp(width * 0.11, 13, 22)}px`,
    );
    element.style.setProperty(
      "--person-subtitle-size",
      `${clamp(width * 0.043, 8, 12)}px`,
    );
    element.style.setProperty(
      "--person-preview-size",
      `${clamp(width * 0.053, 10, 14)}px`,
    );
    element.style.setProperty(
      "--person-media-height",
      `${clamp(Math.round(height * 0.42), 56, Math.max(56, height - 84))}px`,
    );
  } else {
    element.style.removeProperty("--person-node-padding");
    element.style.removeProperty("--person-card-gap");
    element.style.removeProperty("--person-copy-gap");
    element.style.removeProperty("--person-avatar-radius");
    element.style.removeProperty("--person-title-size");
    element.style.removeProperty("--person-subtitle-size");
    element.style.removeProperty("--person-preview-size");
    element.style.removeProperty("--person-media-height");
  }
}

function getNodeResizeLimits(type, node = null) {
  const canvasWidth = elements.graphCanvas?.clientWidth || 2200;
  const canvasHeight = elements.graphCanvas?.clientHeight || 1400;
  const nodeX = toNumber(node?.x, 32);
  const nodeY = toNumber(node?.y, 32);

  if (type === "person") {
    return {
      minWidth: 120,
      maxWidth: Math.max(120, canvasWidth - nodeX - 24),
      minHeight: 110,
      maxHeight: Math.max(110, canvasHeight - nodeY - 24),
    };
  }

  return {
    minWidth: 180,
    maxWidth: Math.max(180, canvasWidth - nodeX - 24),
    minHeight: 120,
    maxHeight: Math.max(120, canvasHeight - nodeY - 24),
  };
}

function updatePersonPhotoPreview() {
  const isPerson = (elements.nodeTypeMenu.dataset.selectedType || "email") === "person";
  const imageValue = isPerson ? state.nodeDraftProfileImage : "";
  const labelValue = String(elements.nodeForm.elements.label.value || "").trim();

  elements.personMediaImage.classList.toggle("hidden", !imageValue);
  elements.personMediaFallback.classList.toggle("hidden", Boolean(imageValue));
  elements.clearPersonPhotoButton.classList.toggle("hidden", !imageValue);
  elements.personMediaPreview.classList.toggle("has-image", Boolean(imageValue));
  elements.personMediaFallback.textContent = getInitials(labelValue || "CI");

  if (imageValue) {
    elements.personMediaImage.src = imageValue;
  } else {
    elements.personMediaImage.removeAttribute("src");
  }
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
  });

  if (response.status === 204) {
    return null;
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && options.redirectOnUnauthorized !== false) {
      redirectToLogin();
      throw new Error("Authentication required.");
    }

    throw new Error(payload.error || "Request failed.");
  }

  return payload;
}

function redirectToLogin() {
  const landingUrl = new URL("./landing.html", window.location.href);
  window.location.replace(landingUrl.toString());
}

function getNodeTypeLabel(type) {
  return NODE_TYPES.find((item) => item.value === type)?.label || type;
}

function getNodeTypeIcon(type) {
  return NODE_TYPES.find((item) => item.value === type)?.icon || "?";
}

function getNodeTypeCode(type) {
  return NODE_TYPES.find((item) => item.value === type)?.code || "SIG";
}

function getSearchTypeLabel(type) {
  const labels = {
    email: "Email",
    username: "Username",
    phone: "Phone",
    domain: "Domain",
    keyword: "Keyword",
    person: "Person",
    hash: "Hash",
  };

  return labels[type] || type;
}

async function readImageAsDataUrl(file) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  const rawDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(rawDataUrl);
  const maxSize = 320;
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.84);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read the image file."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load that image."));
    image.src = src;
  });
}

function getBoardStatus(board) {
  return (board.status || "active").toLowerCase();
}

function getBoardIconMarkup(iconEmoji, accentColor, className) {
  const normalized = String(iconEmoji || DEFAULT_BOARD_DRAFT.iconEmoji);

  if (isFolderBoardIcon(normalized)) {
    return `
      <span class="${className} board-icon-custom" style="--board-icon-color: ${escapeText(accentColor || DEFAULT_BOARD_DRAFT.accentColor)};">
        <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
          <path d="M8 18a6 6 0 0 1 6-6h13l6 7h17a6 6 0 0 1 6 6v5H8z" fill="currentColor" opacity="0.78"></path>
          <path d="M8 24a6 6 0 0 1 6-6h36a6 6 0 0 1 6 6v22a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6z" fill="currentColor"></path>
        </svg>
      </span>
    `;
  }

  return `<span class="${className}">${escapeText(normalized)}</span>`;
}

function isFolderBoardIcon(iconEmoji) {
  return ["\u{1F4C1}", "\u{1F5C2}\uFE0F", "\u{1F5C3}\uFE0F"].includes(iconEmoji);
}

function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
  if (id === "deleteBoardModal" && state.pendingBoardDeletion) {
    const { resolve } = state.pendingBoardDeletion;
    state.pendingBoardDeletion = null;
    resolve(false);
  }

  document.getElementById(id).classList.add("hidden");

  if (id === "nodeModal") {
    state.nodeDraftProfileImage = "";
    elements.personPhotoInput.value = "";
    elements.nodeProfileImageData.value = "";
  }
}

function getNodeElement(nodeId) {
  return elements.graphNodes.querySelector(`[data-id="${CSS.escape(nodeId)}"]`);
}

function getNodeCenter(element) {
  return {
    x: element.offsetLeft + element.offsetWidth / 2,
    y: element.offsetTop + element.offsetHeight / 2,
  };
}

function formatDate(value) {
  if (!value) {
    return "Just now";
  }

  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function clampFloat(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function parseMetricValue(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function formatMetricValue(value) {
  const numeric = parseMetricValue(value);
  return numeric === null ? "--" : numeric.toLocaleString();
}

function toDisplayLabel(value) {
  return String(value || "")
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getLocalDateStamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toNumber(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function normalizeImportedDisplayText(value) {
  return String(value || "")
    .replaceAll("Ã¢â‚¬Â¢", "-")
    .replaceAll("â€¢", "-")
    .replaceAll("Â·", "-")
    .trim();
}

function getInitials(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "CI";
}

function normalizeBoardColor(value) {
  const normalized = String(value || "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
    return normalized.toLowerCase();
  }

  return DEFAULT_BOARD_DRAFT.accentColor;
}

function escapeText(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
