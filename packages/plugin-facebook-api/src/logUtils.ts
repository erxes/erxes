import { putCreateLog as commonPutCreateLog } from '@erxes/api-utils/src/logUtils';
import { IModels } from './connectionResolver';

const gatherDescriptions = (models, subdomain, logDoc) => {
  let description = '';
  let extraDesc = '';

  return { description, extraDesc };
};

export const putCreateLog = async (
  models: IModels,
  subdomain: string,
  logDoc,
  customerId,
) => {
  const { description, extraDesc } = gatherDescriptions(models, subdomain, {
    ...logDoc,
    action: 'create',
  });

  // FIXME: commonPutCreateLog's 3rd parameter is supposed to be user, not customer.
  // const customer = await models.Customers.findOne({ _id: customerId }).lean();

  // if(customer) {
  //   await commonPutCreateLog(
  //     subdomain,
  //     { ...logDoc, description, extraDesc, type: `facebook:${logDoc.type}` },
  //     customer,
  //   );
  // }
};
