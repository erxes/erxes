const CryptoJS = require('crypto-js');

export function encryptData(data: any, keySession: string, keyiv: string) {
  const hash = CryptoJS.SHA256(JSON.stringify(data));
  const hex = hash.toString(CryptoJS.enc.Hex);
  // key-үүдийг parse хийж байгаа
  const sessionKey = CryptoJS.enc.Latin1.parse(keySession.toString());
  const ivKey = CryptoJS.enc.Latin1.parse(keyiv.toString());

  const encrypted = CryptoJS.AES.encrypt(hex, sessionKey, {
    mode: CryptoJS.mode.CBC,
    iv: ivKey,
  });
  return encrypted.toString();
}
