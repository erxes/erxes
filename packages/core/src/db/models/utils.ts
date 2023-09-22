import { randomAlphanumeric } from '@erxes/api-utils/src/random';
import * as faker from 'faker';

export const getUniqueValue = async (
  collection: any,
  fieldName: string = 'code',
  defaultValue?: string
) => {
  const getRandomValue = (type: string) =>
    type === 'email' ? faker.internet.email().toLowerCase() : randomAlphanumeric();

  let uniqueValue = defaultValue || getRandomValue(fieldName);

  let duplicated = await collection.findOne({ [fieldName]: uniqueValue });

  while (duplicated) {
    uniqueValue = getRandomValue(fieldName);

    duplicated = await collection.findOne({ [fieldName]: uniqueValue });
  }

  return uniqueValue;
};

export const checkCodeDuplication = async (collection, code: string) => {
  if (code.includes('/')) {
    throw new Error('The "/" character is not allowed in the code');
  }

  const category = await collection.findOne({
    code
  });

  if (category) {
    throw new Error('Code must be unique');
  }
};
