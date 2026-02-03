const CryptoJS = require("crypto-js");

export function encryptData(
  data: Record<string, unknown>,
  keySession: string,
  keyiv: string
) {
  // Runtime guard to prevent accidental credential hashing
  if ("configPassword" in data) {
    throw new Error(
      "Security violation: encryptData must not receive credentials (configPassword)"
    );
  }

  /* CodeQL [js/weak-password-hash]:
   * False positive – SHA-256 is used for request payload integrity/signing
   * per Golomt Bank API requirements, not for password hashing.
   */
  const payloadHash = CryptoJS.SHA256(JSON.stringify(data));
  const hexPayloadHash = payloadHash.toString(CryptoJS.enc.Hex);

  // Parse encryption keys
  const sessionKey = CryptoJS.enc.Latin1.parse(keySession);
  const ivKey = CryptoJS.enc.Latin1.parse(keyiv);

  const encrypted = CryptoJS.AES.encrypt(hexPayloadHash, sessionKey, {
    mode: CryptoJS.mode.CBC,
    iv: ivKey,
  });

  return encrypted.toString();
}
