import { sendContactsMessage, sendCoreMessage } from '../messageBroker';

export const validCampaign = doc => {
  if (
    !doc.startDate ||
    doc.startDate.getTime() - new Date().getTime() < -24 * 1000 * 60 * 60
  ) {
    throw new Error('The start date must be in the future');
  }

  if (doc.endDate && doc.startDate > doc.endDate) {
    throw new Error('The end date must be after from start date');
  }

  if (doc.finishDateOfUse && doc.endDate > doc.finishDateOfUse) {
    throw new Error('The finish date of use must be after from end date');
  }
};

export const randomBetween = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

const RandomTypes = {
  '0-9': '0123456789',
  'a-z': 'abcdefghijklmnopqrstuvwxyz',
  'A-Z': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'a-Z': 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  '0-z': '0123456789abcdefghijklmnopqrstuvwxyz',
  '0-Z': '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  '0-zZ': '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
};

const generateRandom = (type: string, len: number) => {
  const charSet = RandomTypes[type] || '0123456789';

  let randomString = '';

  for (let i = 0; i < len; i++) {
    const position = Math.floor(Math.random() * charSet.length);
    randomString = `${randomString}${charSet.substring(
      position,
      position + 1
    )}`;
  }

  return randomString;
};

export const getRandomNumber = number => {
  const re = /{ \[.-..?\] \* [0-9]* }/g;
  const items = number.match(/{ \[.-..?\] \* [0-9]* }|./g);

  const result: string[] = [];
  for (const item of items) {
    let str = item;

    if (re.test(str)) {
      const key = (str.match(/\[.-..?\]/g)[0] || '')
        .replace('[', '')
        .replace(']', '');
      let len = Number(
        (str.match(/ \* [0-9]* /g)[0] || '').substring(3) || '0'
      );
      if (isNaN(len)) {
        len = 8;
      }

      str = generateRandom(key, len);
    }

    result.push(str);
  }

  return result.join('');
};

export const getOwner = async (subdomain, ownerType, ownerId) => {
  switch (ownerType) {
    case 'customer':
      return await sendContactsMessage({
        subdomain,
        action: 'customers.findOne',
        data: { _id: ownerId },
        isRPC: true
      });
    case 'user':
      return await sendCoreMessage({
        subdomain,
        action: 'users.findOne',
        data: { _id: ownerId },
        isRPC: true
      });
    case 'company':
      return await sendContactsMessage({
        subdomain,
        action: 'companies.findOne',
        data: { _id: ownerId },
        isRPC: true
      });
    default:
      return {};
  }
};
