import * as faker from 'faker';
import { Configs, Stats } from '../models';

/**
 * Returns random element of an array
 */
export const randomElementOfArray = array => {
  return array[Math.floor(Math.random() * array.length)];
};

export const configFactory = params => {
  const configObj = new Configs({
    code: params.code || faker.random.word(),
    value: params.value || faker.random.word(),
  });

  return configObj.save();
};

export const statsFactory = params => {
  const statsObj = new Stats({
    engageMessageId: params.engageMessageId || faker.random.id(),
    open: params.open || faker.random.number(),
    click: params.click || faker.random.number(),
    complaint: params.complaint || faker.random.number(),
    delivery: params.delivery || faker.random.number(),
    bounce: params.bounce || faker.random.number(),
    reject: params.reject || faker.random.number(),
    send: params.send || faker.random.number(),
    renderingfailure: params.renderingfailure || faker.random.number(),
    total: params.total || faker.random.number(),
  });

  return statsObj.save();
};
