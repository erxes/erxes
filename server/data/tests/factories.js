import Random from 'meteor-random';
import faker from 'faker';
import { Integrations, Brands } from '../connectors';

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
