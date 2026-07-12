const CryptoJS = require('crypto-js');
const unpad = (s) => {
  const paddingLength = s.charCodeAt(s.length - 1);
  return s.slice(0, s.length - paddingLength);
};

export async function decryptData(data: any, IV_KEY, SESSION_KEY) {
  const decrypted = CryptoJS.AES.decrypt(
    data,
    CryptoJS.enc.Latin1.parse(SESSION_KEY),
    {
      iv: CryptoJS.enc.Latin1.parse(IV_KEY),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.NoPadding,
    },
  );
  return unpad(decrypted.toString(CryptoJS.enc.Utf8));
}
