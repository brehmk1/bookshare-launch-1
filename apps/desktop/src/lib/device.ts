function normalizePlatform() {
  const platform =
    (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ||
    navigator.platform ||
    "unknown";
  return platform.toLowerCase().includes("win") ? "windows" : platform.toLowerCase();
}

export function getDeviceName() {
  return `BookShare Desktop ${normalizePlatform()}`;
}

export function getDevicePlatform() {
  return normalizePlatform();
}

export function getOrCreateLocalDeviceId() {
  const storageKey = "bookshare.desktop.device-id";
  const existing = window.localStorage.getItem(storageKey);

  if (existing) {
    return existing;
  }

  const created = crypto.randomUUID();
  window.localStorage.setItem(storageKey, created);
  return created;
}
