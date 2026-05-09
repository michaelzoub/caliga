import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const COOKIE_PREFIX = "article_access_";

export function createPreviewToken() {
  return randomBytes(24).toString("hex");
}

export function hashArticlePassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const digest = createHash("sha256")
    .update(`${salt}:${password}`)
    .digest("hex");
  return `${salt}:${digest}`;
}

export function verifyArticlePassword(password: string, storedHash: string | null) {
  if (!storedHash) return true;
  const [salt, digest] = storedHash.split(":");
  if (!salt || !digest) return false;
  const candidate = createHash("sha256")
    .update(`${salt}:${password}`)
    .digest("hex");
  const a = Buffer.from(candidate, "hex");
  const b = Buffer.from(digest, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

function secret() {
  return process.env.DASHBOARD_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

export function articleAccessCookieName(articleId: string) {
  return `${COOKIE_PREFIX}${articleId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

export function articleAccessCookieValue(articleId: string, passwordHash: string) {
  return createHmac("sha256", secret())
    .update(`${articleId}:${passwordHash}`)
    .digest("hex");
}

export function isValidArticleAccessCookie(
  articleId: string,
  passwordHash: string | null,
  cookieValue: string | undefined
) {
  if (!passwordHash) return true;
  if (!cookieValue) return false;
  const expected = articleAccessCookieValue(articleId, passwordHash);
  const a = Buffer.from(cookieValue, "hex");
  const b = Buffer.from(expected, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
