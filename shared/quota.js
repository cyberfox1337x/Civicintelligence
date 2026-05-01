export const DAILY_SEARCH_QUOTA = 400;
export const DAILY_SEARCH_WINDOW_MS = 24 * 60 * 60 * 1000;

export function getSearchQuotaWindowStart(now = Date.now()) {
  return Number(now) - DAILY_SEARCH_WINDOW_MS;
}

export function getRemainingSearchQuota(usedCount, limit = DAILY_SEARCH_QUOTA) {
  const used = Math.max(0, Number(usedCount) || 0);
  return Math.max(0, limit - used);
}
