import { getConfig } from './utils';
import { sendTRPCMessage } from 'erxes-api-shared/src/utils';
import { validCompanyCode } from './customerToErkhet';

export const consumeCustomer = async (subdomain, doc, old_code, action) => {
  const config = await getConfig(subdomain, 'ERKHET', {});
  const isCompany = await validCompanyCode(config, doc.code);

  if (isCompany) {
    const company = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'companies',
      action: 'findOne',
      input: { companyCode: old_code },
      defaultValue: null
    });

    if ((action === 'update' && old_code) || action === 'create') {
      const document = {
        primaryName: doc.name,
        code: doc.code,
        names: [doc.name]
      };

      if (company) {
        await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'mutation',
          module: 'companies',
          action: 'updateCompany',
          input: { _id: company._id, doc: { ...document } },
        });
      } else {
        await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'mutation',
          module: 'companies',
          action: 'createCompany',
          input: { ...document },
        });
      }
    } else if (action === 'delete' && company) {
      await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'mutation',
        module: 'companies',
        action: 'removeCompanies',
        input: { _ids: [company._id] },
      });
    }
  } else {
    const customer = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'customers',
      action: 'findOne',
      input: { customerCode: old_code },
      defaultValue: null
    });

    if ((action === 'update' && old_code) || action === 'create') {
      const document = {
        firstName: doc.name,
        code: doc.code,
        primaryEmail: doc.mail,
        primaryPhone: doc.phone,
        emails: [{ email: doc.mail, type: 'other' }],
        phones: [{ phone: doc.phone, type: 'other' }]
      };

      if (customer) {
        await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'mutation',
          module: 'customers',
          action: 'updateCustomer',
          input: { _id: customer._id, doc: { ...document, state: 'customer' } },
        });
      } else {
        await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'mutation',
          module: 'customers',
          action: 'createCustomer',
          input: { ...document, state: 'customer' },
        });
      }
    } else if (action === 'delete' && customer) {
      await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'mutation',
        module: 'customers',
        action: 'removeCustomers',
        input: { _ids: [customer._id] },
      });
    }
  }
};
