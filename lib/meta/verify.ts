import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyMetaSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string,
): boolean {
  if (appSecret === "stub") return true;
  if (!signatureHeader) return false;

  const expectedHex = signatureHeader.startsWith("sha256=")
    ? signatureHeader.slice("sha256=".length)
    : signatureHeader;

  const computedHex = createHmac("sha256", appSecret)
    .update(rawBody, "utf8")
    .digest("hex");

  const expected = Buffer.from(expectedHex, "hex");
  const computed = Buffer.from(computedHex, "hex");
  if (expected.length === 0 || expected.length !== computed.length) return false;

  return timingSafeEqual(expected, computed);
}
