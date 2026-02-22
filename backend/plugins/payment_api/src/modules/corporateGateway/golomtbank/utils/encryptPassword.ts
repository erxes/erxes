import * as crypto from 'crypto';

export const encryptPassword = (
  data: string,
  keySession: string,
  keyIv: string,
): string => {
  /**
   * Golomt Bank uses AES-128-CBC
   * key = 16 bytes
   * iv  = 16 bytes
   */

  const key = Uint8Array.from(Buffer.from(keySession, 'latin1'));
  const iv = Uint8Array.from(Buffer.from(keyIv, 'latin1'));

  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);

  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  return encrypted;
};
