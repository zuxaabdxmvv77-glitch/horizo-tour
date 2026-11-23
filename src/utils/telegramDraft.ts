import {SITE_CONTACT} from '../data/siteConfig';

const DRAFT_STORAGE_KEY = 'horizo_tg_draft';
let memoryDraft = '';

export function buildTelegramDraftUrl(plainText: string): string {
  const cleaned = plainText.trim();
  if (!cleaned) {
    return SITE_CONTACT.telegramHref;
  }
  return `https://t.me/${SITE_CONTACT.telegramUsername}?text=${encodeURIComponent(cleaned)}`;
}

export function buildTelegramAppUrl(plainText: string): string {
  const cleaned = plainText.trim();
  if (!cleaned) {
    return `tg://resolve?domain=${SITE_CONTACT.telegramUsername}`;
  }
  return `tg://resolve?domain=${SITE_CONTACT.telegramUsername}&text=${encodeURIComponent(cleaned)}`;
}

export function saveLatestTelegramDraft(plainText: string): void {
  memoryDraft = plainText;
  try {
    if (plainText.trim()) {
      window.sessionStorage.setItem(DRAFT_STORAGE_KEY, plainText);
    } else {
      window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  } catch {
    // Ignore storage failures in restricted iframes
  }
}

export function getLatestTelegramDraft(fallbackGreeting = ''): string {
  if (memoryDraft.trim()) {
    return memoryDraft;
  }
  try {
    const stored = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (stored && stored.trim()) {
      return stored;
    }
  } catch {
    // Ignore storage failures
  }
  return fallbackGreeting;
}

export function copyTextSafely(plainText: string): void {
  if (!plainText.trim()) return;
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      void navigator.clipboard.writeText(plainText).catch(() => {});
    }
  } catch {
    // Ignore clipboard restrictions
  }
}

export function openTelegramWithDraft(plainText: string): void {
  saveLatestTelegramDraft(plainText);
  copyTextSafely(plainText);

  const url = buildTelegramDraftUrl(plainText);
  try {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } catch {
    // Fallback handled by visible confirmation button in UI
  }
}
