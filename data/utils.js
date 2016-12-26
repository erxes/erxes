import { Brands, Customers, Integrations } from './connectors';

export const getIntegration = (brandCode) =>
  Brands.findOne({ code: brandCode })
    .then(brand =>
      // find integration by brand
      Integrations.findOne({
        brandId: brand._id,
        kind: 'in_app_messaging',
      })
    );

export const getCustomer = (integrationId, email) =>
  Customers.findOne({ email, integrationId });
