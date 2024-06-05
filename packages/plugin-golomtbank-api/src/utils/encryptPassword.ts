var CryptoJS = require("crypto-js");

export function encryptedPassword(data:any, keySession:string, keyiv:string) {
    // key-үүдийг parse хийж байгаа
    var sessionKey = CryptoJS.enc.Latin1.parse(keySession.toString());
    var ivKey = CryptoJS.enc.Latin1.parse(keyiv.toString());
    var encryptedPass = CryptoJS.AES.encrypt(data.toString(), sessionKey, {
        mode: CryptoJS.mode.CBC,    
        iv: ivKey,    
    });
    return encryptedPass.toString()
}