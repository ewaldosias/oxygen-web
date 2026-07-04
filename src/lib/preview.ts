// DEV-ONLY preview mode. Lets internal screens render without a login,
// so the design can be reviewed. NEVER active in production builds.
// Enable by appending ?preview=1 to the URL while running `npm run dev`.
export function isPreview(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).has("preview");
  } catch {
    return false;
  }
}
