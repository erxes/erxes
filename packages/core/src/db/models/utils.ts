import * as faker from 'faker';
import * as Random from 'meteor-random';
import { IBranch, IDepartment, IUnit } from './definitions/structures';

export const getUniqueValue = async (
  collection: any,
  fieldName: string = 'code',
  defaultValue?: string
) => {
  const getRandomValue = (type: string) =>
    type === 'email' ? faker.internet.email().toLowerCase() : Random.id();

  let uniqueValue = defaultValue || getRandomValue(fieldName);

  let duplicated = await collection.findOne({ [fieldName]: uniqueValue });

  while (duplicated) {
    uniqueValue = getRandomValue(fieldName);

    duplicated = await collection.findOne({ [fieldName]: uniqueValue });
  }

  return uniqueValue;
};

export const generateOrder = (
  doc: IBranch | IDepartment | IUnit,
  parent?: IBranch | IDepartment | IUnit
) => {
  const order = parent ? `${parent.order}${doc.code}/` : `${doc.code}/`;

  return order;
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
