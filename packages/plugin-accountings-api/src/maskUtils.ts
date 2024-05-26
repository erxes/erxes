import { IAccountCategory } from './models/definitions/accountCategory';

export const checkCodeMask = async (
  category?: IAccountCategory,
  code?: string,
) => {
  if (!category || !code) {
    return false;
  }

  if (
    !category?.maskType ||
    !category?.mask?.values
  ) {
    return true;
  }

  let maskStr = '';
  const maskList: any[] = [];

  for (const value of category.mask.values || []) {
    if (value.static) {
      maskList.push(value.static);
      continue;
    }

    if (value.type === 'char') {
      maskList.push(value.char.replace(/./g, '\\.'));
    }

    if (value.type === 'customField' && value.matches) {
      maskList.push(`(${Object.values(value.matches).join('|')})`);
    }
  }
  maskStr = `${maskList.join('')}.*`;

  const mask = new RegExp(maskStr, 'g');

  if (await mask.test(code)) {
    return true;
  }

  return false;
};
