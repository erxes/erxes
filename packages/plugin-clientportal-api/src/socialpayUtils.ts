import { sendRequest } from '@erxes/api-utils/src/requests';
import * as crypto from 'crypto';

export const encrypt = (data, publicKey) => {
  try {
    const pubKey = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;
    const bufferData = Buffer.from(data, 'utf-8');
    const encrypted = crypto.publicEncrypt(
      {
        key: pubKey,
        padding: crypto.constants.RSA_PKCS1_PADDING
      },
      bufferData
    );
    return encrypted.toString('base64');
  } catch (ex) {
    console.error(ex);
    return '';
  }
};

export const decrypt = (cipherText, privateKey) => {
  try {
    const privKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
    const bufferCipherText = Buffer.from(cipherText, 'base64');
    const decrypted = crypto.privateDecrypt(
      {
        key: privKey,
        padding: crypto.constants.RSA_PKCS1_PADDING
      },
      bufferCipherText
    );
    return decrypted.toString('utf-8');
  } catch (ex) {
    console.error(ex);
    return null;
  }
};

export const getHex = data => {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');
};

export const fetchUserFromSocialpay = async (token: string) => {
  const pubKey = process.env.SOCIALPAY_PUBLIC_KEY;
  const certId = process.env.SOCIALPAY_CERT_ID;
  if (!pubKey || !certId) {
    throw new Error('Socialpay public key or cert id is not set');
  }

  // generate x-golomt-signature using token and public key
  const hex = getHex(JSON.stringify({ token }));
  const signature = encrypt(hex, pubKey);
  try {
    const response = await sendRequest({
      url:
        'https://sp-api.golomtbank.com/api/utility/miniapp/token/check?language=mn',
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'X-Golomt-Cert-Id': certId,
        'X-Golomt-Signature': signature
      },
      body: {
        token
      }
    });

    return response;
  } catch (e) {
    console.error(e);
    return null;
  }
};
