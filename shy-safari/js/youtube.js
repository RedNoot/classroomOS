// Pulls the video id out of the usual kinds of YouTube link.
export function youTubeId(text) {
  try {
    const u = new URL(text.trim());
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
    if (u.hostname === "youtube.com" || u.hostname.endsWith(".youtube.com")) {
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      const m = u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/);
      if (m) return m[1];
    }
  } catch {}
  return null;
}
