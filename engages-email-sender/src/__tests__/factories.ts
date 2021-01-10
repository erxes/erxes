import * as faker from 'faker';
import { SES_DELIVERY_STATUSES } from '../constants';
import { Configs, DeliveryReports, Stats } from '../models';

/**
 * Returns random element of an array
 */
export const randomElementOfArray = array => {
  return array[Math.floor(Math.random() * array.length)];
};

export const configFactory = params => {
  const configObj = new Configs({
    code: params.code || faker.random.word(),
    value: params.value || faker.random.word()
  });

  return configObj.save();
};

export const statsFactory = params => {
  const statsObj = new Stats({
    engageMessageId: params.engageMessageId || faker.random.uuid(),
    open: params.open || faker.random.number(),
    click: params.click || faker.random.number(),
    complaint: params.complaint || faker.random.number(),
    delivery: params.delivery || faker.random.number(),
    bounce: params.bounce || faker.random.number(),
    reject: params.reject || faker.random.number(),
    send: params.send || faker.random.number(),
    renderingfailure: params.renderingfailure || faker.random.number(),
    total: params.total || faker.random.number()
  });

  return statsObj.save();
};

export const generateCustomerDoc = (params: any = {}) => ({
  _id: faker.random.uuid(),
  primaryEmail: params.email || faker.internet.email(),
  emailValidationStatus: 'valid',
  primaryPhone: faker.phone.phoneNumber(),
  phoneValidationStatus: 'valid',
  replacers: [{ key: 'key', value: 'value' }]
});

export const reportFactory = (params: any) => {
  const report = new DeliveryReports({
    customerId: params.customerId || faker.random.uuid(),
    mailId: params.mailId || faker.random.uuid(),
    status: params.status || randomElementOfArray(SES_DELIVERY_STATUSES.ALL),
    engageMessageId: params.engageMesageId || faker.random.uuid(),
    email: params.email || faker.internet.email()
  });

  return report.save();
};

export const generateCustomerDocList = (count: number) => {
  const list: any[] = [];

  for (let i = 0; i < count; i++) {
    list.push(generateCustomerDoc());
  }

  return list;
};
