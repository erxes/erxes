import { putCreateLog as commonPutCreateLog } from '@erxes/api-utils/src/logUtils';
import { IModels } from './connectionResolver';
import messageBroker from './messageBroker';

const gatherDescriptions = (models, subdomain, logDoc) => {
  let description = '';
  let extraDesc = '';

  return { description, extraDesc };
};

export const putCreateLog = async (
  models: IModels,
  subdomain: string,
  logDoc,
  customerId
) => {
  const { description, extraDesc } = gatherDescriptions(models, subdomain, {
    ...logDoc,
    action: 'create'
  });

  const customer = await models.Customers.findOne({ _id: customerId }).lean();

  await commonPutCreateLog(
    subdomain,
    messageBroker(),
    { ...logDoc, description, extraDesc, type: `facebook:${logDoc.type}` },
    customer
  );
};
