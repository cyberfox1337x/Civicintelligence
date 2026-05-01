const state = {
  items: [],
  loading: false,
};

const elements = {
  emptyState: document.getElementById("emptyState"),
  form: document.getElementById("itemForm"),
  formMessage: document.getElementById("formMessage"),
  list: document.getElementById("itemList"),
  listStatus: document.getElementById("listStatus"),
  refreshButton: document.getElementById("refreshButton"),
  submitButton: document.getElementById("submitButton"),
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  bindEvents();
  await loadItems();
}

function bindEvents() {
  elements.form.addEventListener("submit", handleSubmit);
  elements.refreshButton.addEventListener("click", loadItems);
}

async function loadItems() {
  setLoading(true);
  elements.listStatus.textContent = "Loading items...";

  try {
    const payload = await apiRequest("/api/items");
    state.items = payload.items || [];
    elements.listStatus.textContent = state.items.length ? "" : "Loaded.";
    renderItems();
  } catch (error) {
    elements.listStatus.textContent = error.message || "Unable to load items.";
  } finally {
    setLoading(false);
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const name = String(formData.get("name") || "").trim();

  if (!name) {
    elements.formMessage.textContent = "Name is required.";
    return;
  }

  elements.submitButton.disabled = true;
  elements.formMessage.textContent = "Saving...";

  try {
    await apiRequest("/api/items", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    event.currentTarget.reset();
    elements.formMessage.textContent = "Saved.";
    await loadItems();
  } catch (error) {
    elements.formMessage.textContent = error.message || "Unable to save item.";
  } finally {
    elements.submitButton.disabled = false;
  }
}

function renderItems() {
  elements.list.innerHTML = "";
  elements.emptyState.hidden = state.items.length > 0;

  for (const item of state.items) {
    const li = document.createElement("li");
    li.className = "item-card";
    li.textContent = item.name;
    elements.list.appendChild(li);
  }
}

function setLoading(isLoading) {
  state.loading = isLoading;
  elements.refreshButton.disabled = isLoading;
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

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "Request failed.");
  }

  return payload;
}
