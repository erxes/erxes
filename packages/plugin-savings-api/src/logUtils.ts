import { getSchemaLabels } from '@erxes/api-utils/src/logUtils';

import { contractSchema } from './models/definitions/contracts';
import { transactionSchema } from './models/definitions/transactions';
import { periodLockSchema } from './models/definitions/periodLocks';
import { contractTypeSchema } from './models/definitions/contractTypes';

import { putCreateLog, putDeleteLog, putUpdateLog } from '@erxes/api-utils/src';
import messageBroker from './messageBroker';
import * as _ from 'underscore';

const gatherContractFieldNames = async (_models, _doc, prevList = null) => {
  let options = [];

  if (prevList) {
    options = prevList;
  }

  return options;
};

interface IParams {
  action?: string;
  type: string;
  object: any;
  extraParams: any;
}

export const gatherDescriptions = async (params: IParams) => {
  const { action, object, type, extraParams } = params;
  const { models } = extraParams;

  let extraDesc = [];
  let description = '';

  switch (type) {
    case 'contract': {
      description = `${object.number} has been ${action}d`;

      extraDesc = await gatherContractFieldNames(models, object);
      break;
    }

    case 'collateral': {
      description = `${object.code} has been ${action}d`;

      extraDesc = await gatherContractFieldNames(models, object);
      break;
    }
    default:
      break;
  }
  return { extraDesc, description };
};

export async function createLog(subdomain, user, logData) {
  const descriptions = gatherDescriptions(logData);

  await putCreateLog(
    subdomain,
    messageBroker(),
    {
      ...logData,
      ...descriptions,
      type: `savings:${logData.type}`
    },
    user
  );
}

export async function updateLog(subdomain, user, logData) {
  const descriptions = gatherDescriptions(logData);

  await putUpdateLog(
    subdomain,
    messageBroker(),
    {
      ...logData,
      ...descriptions,
      type: `savings:${logData.type}`
    },
    user
  );
}

export async function deleteLog(subdomain, user, logData) {
  const descriptions = gatherDescriptions(logData);
  await putDeleteLog(
    subdomain,
    messageBroker(),
    { ...logData, ...descriptions, type: `savings:${logData.type}` },
    user
  );
}

export default {
  getSchemaLabels: ({ data: { type } }) => ({
    status: 'success',
    data: getSchemaLabels(type, [
      { name: 'contract', schemas: [contractSchema] },
      { name: 'transaction', schemas: [transactionSchema] },
      { name: 'periodLock', schemas: [periodLockSchema] },
      { name: 'contractType', schemas: [contractTypeSchema] }
    ])
  })
};
