const STORAGE_KEY = 'stockwise_data';
const STORAGE_VERSION = 1;

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (parsed._version !== STORAGE_VERSION) {
      console.warn('Storage version mismatch, resetting.');
      localStorage.removeItem(STORAGE_KEY);
      return undefined;
    }
    return parsed.state;
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
    localStorage.removeItem(STORAGE_KEY);
    return undefined;
  }
}

export function saveState(state) {
  try {
    const data = {
      _version: STORAGE_VERSION,
      _savedAt: new Date().toISOString(),
      state,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}

// Debounced save to avoid excessive writes
let saveTimer = null;
export function debouncedSaveState(state, delay = 1000) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveState(state), delay);
}
