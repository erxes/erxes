import * as crypto from 'crypto';

import { IEncryptionData } from './types';

export interface IOrderInput {
  _id: string;
  order: number;
}

export const updateOrder = async (collection: any, orders: IOrderInput[]) => {
  
  if (orders.length === 0) {
    return [];
  }

  const ids: string[] = [];
  const bulkOps: Array<{
    updateOne: {
      filter: { _id: string };
      update: { order: number };
    };
  }> = [];

  for (const { _id, order } of orders) {
    ids.push(_id);

    const selector: { order: number } = { order };

    bulkOps.push({
      updateOne: {
        filter: { _id },
        update: selector,
      },
    });
  }

  await collection.bulkWrite(bulkOps);

  return collection.find({ _id: { $in: ids } }).sort({ order: 1 });
};

export const encryptText = (text: string): IEncryptionData => {
  const algorithm = 'aes-256-cbc';
  // key must be 32 bytes long
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);

  try {
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);

    // Update the cipher with data
    let encrypted = cipher.update(text);

    // Finalize encryption, so that no data can be written again
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Returning iv and encrypted data
    return {
      algorithm,
      key,
      iv: iv.toString('hex'),
      encryptedData: encrypted.toString('hex'),
    };
  } catch (e) {
    throw new Error(e);
  }
};

export const decryptText = (data: IEncryptionData): string => {
  const iv = Buffer.from(data.iv, 'hex');

  const encryptedText = Buffer.from(data.encryptedData, 'hex');

  const decipher = crypto.createDecipheriv(data.algorithm, Buffer.from(data.key), iv);

  // decipher
  let decrypted = decipher.update(encryptedText);

  // finalize decryption
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};
