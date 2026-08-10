import {
  TAutomationFindObjectResult,
  TAutomationProducers,
  TAutomationProducersInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { SALES_DEAL_FIND_OBJECT_TYPE } from '~/modules/sales/meta/automations/constants';

type TFindObjectData =
  TAutomationProducersInput[TAutomationProducers.FIND_OBJECT];

const generateDealFilter = (field: string, value: string) => {
  if (field === '_id') {
    return { _id: value };
  }

  if (field === 'name') {
    return { name: value };
  }

  if (field === 'number') {
    return { number: value };
  }

  return null;
};

export const findSalesObject = async (
  models: IModels,
  data: TFindObjectData,
): Promise<TAutomationFindObjectResult> => {
  const { objectType, field, value } = data;

  if (objectType !== SALES_DEAL_FIND_OBJECT_TYPE) {
    throw new Error(`Unsupported sales find object type: ${objectType}`);
  }

  const filter = generateDealFilter(field, value);

  if (!filter) {
    throw new Error(`Unsupported lookup field "${field}" for "Deal"`);
  }

  const doc = await models.Deals.findOne(filter).lean();

  return {
    found: !!doc,
    objectType,
    objectId:
      typeof doc?._id === 'string'
        ? doc._id
        : doc?._id
          ? String(doc._id)
          : undefined,
    object: doc || null,
    matchedBy: {
      field,
      value,
    },
  };
};
