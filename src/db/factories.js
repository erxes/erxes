import faker from 'faker';
import Random from 'meteor-random';

import {
  Users,
  Brands,
  EmailTemplates,
  ResponseTemplates,
  Customers,
  Forms,
  Fields,
  Segments,
  Companies,
} from './models';

export const userFactory = (params = {}) => {
  const user = new Users({
    username: params.username || faker.random.word(),
    details: {
      fullName: params.fullName || faker.random.word(),
    },
  });

  return user.save();
};

export const brandFactory = (params = {}) => {
  const brand = new Brands({
    name: faker.random.word(),
    code: params.code || faker.random.word(),
    userId: () => Random.id(),
    description: params.description || faker.random.word(),
    emailConfig: {
      type: 'simple',
      template: faker.random.word(),
    },
  });

  return brand.save();
};

export const emailTemplateFactory = (params = {}) => {
  const emailTemplate = new EmailTemplates({
    name: faker.random.word(),
    content: params.content || faker.random.word(),
  });

  return emailTemplate.save();
};

export const responseTemplateFactory = (params = {}) => {
  const responseTemplate = new ResponseTemplates({
    name: faker.random.word(),
    content: params.content || faker.random.word(),
    brandId: params.brandId || Random.id(),
    files: [faker.random.image()],
  });

  return responseTemplate.save();
};

export const segmentFactory = (params = {}) => {
  const defaultConditions = [
    {
      field: 'messengerData.sessionCount',
      operator: 'e',
      value: '10',
      dateUnit: 'days',
      type: 'string',
    },
  ];

  const segment = new Segments({
    name: faker.random.word(),
    description: params.description || faker.random.word(),
    subOf: params.subOf || 'DFSAFDFDSFDSF',
    color: params.color || '#ffff',
    connector: params.connector || 'any',
    conditions: params.conditions || defaultConditions,
  });

  return segment.save();
};

export const companyFactory = (params = {}) => {
  const company = new Companies({
    name: faker.random.word(),
    size: params.size || faker.random.number(),
    industry: params.industry || Random.id(),
    website: params.website || Random.id(),
  });

  return company.save();
};

export const customerFactory = (params = {}) => {
  const customer = new Customers({
    name: params.name || faker.random.word(),
    email: params.email || faker.internet.email(),
    phone: params.phone || faker.random.word(),
  });

  return customer.save();
};

export const fieldFactory = (params = {}) => {
  const field = new Fields({
    type: params.type || 'input',
    validation: params.validation || 'number',
    text: params.text || faker.random.word(),
    description: params.description || faker.random.word(),
    isRequired: params.isRequired || false,
    order: params.order || 0,
  });

  return field.save();
};

export const formFactory = ({ title, code, createdUserId }) => {
  return Forms.create({
    title: title || faker.random.word(),
    description: faker.random.word(),
    code: code || Random.id(),
    createdUserId,
  });
};
