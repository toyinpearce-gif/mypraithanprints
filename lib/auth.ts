import { cookies } from "next/headers";
import { createHash } from "crypto";

export const COOKIE_NAME = "praithan_admin_session";

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function createAdminToken() {
  const secret = process.env.ADMIN_COOKIE_SECRET || "dev-secret";
  return hashValue(`praithan-admin-${secret}`);
}

export function isAdminAuthenticated() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return Boolean(token && token === createAdminToken());
}
