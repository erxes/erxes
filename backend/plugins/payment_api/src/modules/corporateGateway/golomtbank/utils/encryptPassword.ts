const CryptoJS = require('crypto-js');

export function encryptPassword(
  data: string,
  keySession: string,
  keyiv: string
): string {
  // key-үүдийг parse хийж байгаа
  const sessionKey = CryptoJS.enc.Latin1.parse(keySession);
  const ivKey = CryptoJS.enc.Latin1.parse(keyiv);

  const encryptedPass = CryptoJS.AES.encrypt(
    data,
    sessionKey,
    {
      mode: CryptoJS.mode.CBC,
      iv: ivKey,
      padding: CryptoJS.pad.Pkcs7,
    }
  );

  return encryptedPass.toString();
}