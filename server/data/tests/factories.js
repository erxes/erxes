import Random from 'meteor-random';
import faker from 'faker';
import { Integrations, Brands, Forms, FormFields } from '../connectors';

export const brandFactory = (params) => {
  const brand = new Brands({
    name: faker.random.word(),
    code: params.code || faker.random.word(),
    userId: Random.id(),
  });

  return brand.save();
};

export const integrationFactory = (params) => {
  const integration = new Integrations({
    name: faker.random.word(),
    kind: params.kind || 'in_app_messaging',
    brandId: params.brandId || Random.id(),
    formId: params.formId || Random.id(),
  });

  return integration.save();
};

export const formFactory = ({ title }) => {
  const form = new Forms({
    title: title || faker.random.word(),
  });

  return form.save();
};

export const formFieldFactory = (params) => {
  const field = new FormFields({
    formId: params.formId || Random.id(),
    type: faker.random.word(),
    name: faker.random.word(),
    check: faker.random.word(),
    text: faker.random.word(),
    description: faker.random.word(),
    isRequired: params.isRequired || false,
    number: faker.random.word(),
  });

  return field.save();
};
