import { getConfig } from './utils';
import { sendContactsMessage } from '../messageBroker';
import { validCompanyCode } from './customerToErkhet';

export const consumeCustomer = async (subdomain, doc, old_code, action) => {
  const config = await getConfig(subdomain, 'ERKHET', {});

  const isCompany = await validCompanyCode(config, doc.code);

  if (isCompany) {
    const company = await sendContactsMessage({
      subdomain,
      action: 'companies.findOne',
      data: { companyCode: old_code },
      isRPC: true
    });

    if ((action === 'update' && old_code) || action === 'create') {
      const document = {
        primaryName: doc.name,
        code: doc.code,
        names: [doc.name]
      };

      if (company) {
        await sendContactsMessage({
          subdomain,
          action: 'companies.updateCompany',
          data: { _id: company._id, doc: { ...document } },
          isRPC: true
        });
      } else {
        await sendContactsMessage({
          subdomain,
          action: 'companies.createCompany',
          data: { ...document },
          isRPC: true
        });
      }
    } else if (action === 'delete' && company) {
      await sendContactsMessage({
        subdomain,
        action: 'companies.removeCompanies',
        data: { _ids: [company._id] },
        isRPC: true
      });
    }
  } else {
    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: { customerCode: old_code },
      isRPC: true
    });

    if ((action === 'update' && old_code) || action === 'create') {
      const document = {
        firstName: doc.name,
        code: doc.code,
        primaryEmail: doc.mail,
        primaryPhone: doc.phone,
        emails: [doc.mail],
        phones: [doc.phone]
      };

      if (customer) {
        await sendContactsMessage({
          subdomain,
          action: 'customers.updateCustomer',
          data: { _id: customer._id, doc: { ...document } },
          isRPC: true
        });
      } else {
        await sendContactsMessage({
          subdomain,
          action: 'customers.createCustomer',
          data: { ...document },
          isRPC: true
        });
      }
    } else if (action === 'delete' && customer) {
      await sendContactsMessage({
        subdomain,
        action: 'customers.removeCustomers',
        data: { _ids: [customer._id] },
        isRPC: true
      });
    }
  }
};
