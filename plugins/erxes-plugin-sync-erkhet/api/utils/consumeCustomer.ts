import { getConfig } from 'erxes-api-utils'
import { validCompanyCode } from "./customerToErkhet";

export const consumeCustomer = async (models, memoryStorage, doc, old_code, action) => {
  const config = await getConfig(models, memoryStorage, 'ERKHET', {});
  const isCompany = await validCompanyCode(config, doc.code);

  if (isCompany) {
    const company = await models.Companies.findOne({ code: old_code });

    if ((action === 'update' && old_code) || action === 'create') {
      const document = {
        primaryName: doc.name,
        code: doc.code,
        names: [doc.name],
      };

      if (company) {
        models.Companies.updateCompany(company._id, { ...document })
      } else {
        models.Companies.createCompany({ ...document })
      }
    } else if (action === 'delete' && company) {
      models.Companies.removeCompanies([company._id])
    }

  } else {
    const customer = await models.Customers.findOne({ code: old_code });
    if ((action === 'update' && old_code) || action === 'create') {
      const document = {
        firstName: doc.name,
        code: doc.code,
        primaryEmail: doc.mail,
        primaryPhone: doc.phone,
        emails: [doc.mail],
        phones: [doc.phone],
      };

      if (customer) {
        models.Customers.updateCustomer(customer._id, { ...document })
      } else {
        models.Customers.createCustomer({ ...document })
      }
    } else if (action === 'delete' && customer) {
      models.Customer.removeCustomers([customer._id])
    }
  }
}
