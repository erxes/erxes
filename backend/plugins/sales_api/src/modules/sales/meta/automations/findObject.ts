import {
  TAutomationFindObjectResult,
  TAutomationProducers,
  TAutomationProducersInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import {
  SALES_DEAL_FIND_OBJECT_TYPE,
  SALES_POS_ORDER_FIND_OBJECT_TYPE,
} from '~/modules/sales/meta/automations/constants';

type TFindObjectData =
  TAutomationProducersInput[TAutomationProducers.FIND_OBJECT];

type TSalesFindObjectTarget = {
  label: string;
  generateFilter: (
    field: string,
    value: string,
  ) => Record<string, unknown> | null;
  findOne: (
    models: IModels,
    filter: Record<string, unknown>,
    newest: boolean,
  ) => Promise<Record<string, unknown> | null>;
};

const NEWEST = { sort: { createdAt: -1 as const } };

const SALES_FIND_OBJECT_TARGETS: Record<string, TSalesFindObjectTarget> = {
  [SALES_DEAL_FIND_OBJECT_TYPE]: {
    label: 'Deal',
    generateFilter: (field, value) => {
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
    },
    findOne: (models, filter, newest) =>
      models.Deals.findOne(
        filter,
        undefined,
        newest ? NEWEST : undefined,
      ).lean(),
  },
  [SALES_POS_ORDER_FIND_OBJECT_TYPE]: {
    label: 'POS order',
    generateFilter: (field, value) => {
      if (field === '_id') {
        return { _id: value };
      }

      if (field === 'number') {
        return { number: value };
      }

      // A company's or a team member's order shares the field, not the owner
      if (field === 'customerId') {
        return {
          customerId: value,
          customerType: { $in: [null, '', 'customer'] },
        };
      }

      return null;
    },
    findOne: (models, filter, newest) =>
      models.PosOrders.findOne(
        filter,
        undefined,
        newest ? NEWEST : undefined,
      ).lean(),
  },
};

export const findSalesObject = async (
  models: IModels,
  data: TFindObjectData,
): Promise<TAutomationFindObjectResult> => {
  const { objectType, field, value, newest } = data;
  const target = SALES_FIND_OBJECT_TARGETS[objectType];

  if (!target) {
    throw new Error(`Unsupported sales find object type: ${objectType}`);
  }

  const filter = target.generateFilter(field, value);

  if (!filter) {
    throw new Error(
      `Unsupported lookup field "${field}" for "${target.label}"`,
    );
  }

  const doc = await target.findOne(models, filter, !!newest);

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
