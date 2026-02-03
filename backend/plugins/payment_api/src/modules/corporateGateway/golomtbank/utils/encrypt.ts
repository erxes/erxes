const CryptoJS = require("crypto-js");

export function encryptData(data: any, keySession: string, keyiv: string) {
  // This hash is used for request integrity / payload signing
  // required by Golomt Bank API (NOT password hashing)
  const payloadHash = CryptoJS.SHA256(JSON.stringify(data));
  const hex = payloadHash.toString(CryptoJS.enc.Hex);

  // Parse encryption keys
  const sessionKey = CryptoJS.enc.Latin1.parse(keySession);
  const ivKey = CryptoJS.enc.Latin1.parse(keyiv);

  const encrypted = CryptoJS.AES.encrypt(hex, sessionKey, {
    mode: CryptoJS.mode.CBC,
    iv: ivKey,
  });

  return encrypted.toString();
}
