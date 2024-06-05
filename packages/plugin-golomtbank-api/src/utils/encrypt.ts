var CryptoJS = require("crypto-js");

export function encryptData(data:any, keySession:string, keyiv:string) {
    var hash = CryptoJS.SHA256(JSON.stringify(data));
    var hex = hash.toString(CryptoJS.enc.Hex);
    // key-үүдийг parse хийж байгаа
    var sessionKey = CryptoJS.enc.Latin1.parse(keySession.toString());
    var ivKey = CryptoJS.enc.Latin1.parse(keyiv.toString());

    var encrypted = CryptoJS.AES.encrypt(hex, sessionKey, {
        mode: CryptoJS.mode.CBC,    
        iv: ivKey,
        
    });
    // console.log('encrypted::')
    return encrypted.toString()
}