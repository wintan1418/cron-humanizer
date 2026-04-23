// URL hash ⇄ app state. Replace-state, not push, so the back button doesn't
// fill up with micro-edits. Format:  #e=*%2F15+9-17+*+*+1-5&tz=Africa/Lagos

export interface AppState {
  expr: string;
  timezone?: string;
}

export function encodeState(state: AppState): string {
  const params = new URLSearchParams();
  params.set("e", state.expr);
  if (state.timezone) params.set("tz", state.timezone);
  return "#" + params.toString();
}

export function decodeState(hash: string): Partial<AppState> {
  if (!hash || hash === "#") return {};
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(raw);
  const expr = params.get("e") ?? undefined;
  const timezone = params.get("tz") ?? undefined;
  return { ...(expr ? { expr } : {}), ...(timezone ? { timezone } : {}) };
}

export function pushStateToHash(state: AppState): void {
  if (typeof window === "undefined") return;
  const hash = encodeState(state);
  if (window.location.hash !== hash) {
    window.history.replaceState(null, "", hash);
  }
}

export function readStateFromHash(): Partial<AppState> {
  if (typeof window === "undefined") return {};
  return decodeState(window.location.hash);
}
