import {
  IField,
  IFieldCursorParams,
  IFieldDocument,
  IFieldOffsetParams,
  IFieldParams,
} from '@/properties/@types';
import { Resolver } from 'erxes-api-shared/core-types';
import { cursorPaginate, defaultPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext, IModels } from '~/connectionResolvers';

const generateFilter = async (
  models: IModels,
  params: Partial<IFieldParams>,
) => {
  const { contentType, contentTypeId, groupId } = params;

  const filter: FilterQuery<IField> = { contentType };

  if (contentTypeId) {
    filter.contentTypeId = contentTypeId;
  }

  if (groupId) {
    filter.groupId = groupId;
  }

  return filter;
};

const CORE_CONTENT_TYPE_MODELS: Record<string, keyof IModels> = {
  'core:customer': 'Customers',
  'core:company': 'Companies',
  'core:product': 'Products',
  'core:user': 'Users',
};

export const fieldQueries: Record<string, Resolver<any, any, IContext>> = {
  fields: async (
    _: undefined,
    { params }: { params: IFieldCursorParams },
    { models }: IContext,
  ) => {
    const filter = await generateFilter(models, params);

    if (!params.orderBy) {
      params.orderBy = { order: 1 };
    }

    return await cursorPaginate<IFieldDocument>({
      model: models.Fields,
      params,
      query: filter,
    });
  },

  fieldDetail: async (
    _: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return await models.Fields.getField({ _id });
  },

  cpFields: async (
    _: undefined,
    { params }: { params: IFieldOffsetParams },
    { models }: IContext,
  ) => {
    const { sortField = 'code', sortDirection = 1 } = params || {};

    const filter = await generateFilter(models, params);

    return await defaultPaginate(
      models.Fields.find(filter).sort({ [sortField]: sortDirection }),
      params,
    );
  },

  cpFieldDetail: async (
    _: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return await models.Fields.getField({ _id });
  },

  // Which of a select/multiSelect/check/radio field's option values are
  // currently stored on at least one record. Only core-owned content types
  // can be checked here — a plugin-owned content type's records live in that
  // plugin's own database, so this returns null to mean "unknown" rather than
  // an empty (and misleadingly reassuring) list.
  fieldOptionUsedValues: async (
    _: undefined,
    { fieldId }: { fieldId: string },
    { models }: IContext,
  ): Promise<string[] | null> => {
    const field = await models.Fields.findOne({ _id: fieldId }).lean();

    if (!field) {
      return null;
    }

    const modelName = CORE_CONTENT_TYPE_MODELS[field.contentType];

    if (!modelName) {
      return null;
    }

    const values = (field.options || [])
      .map((option: any) =>
        typeof option === 'string' ? option : option?.value,
      )
      .filter((value: unknown): value is string => Boolean(value));

    if (!values.length) {
      return [];
    }

    const model = models[modelName] as unknown as {
      aggregate: (pipeline: any[]) => Promise<Array<{ _id: string }>>;
    };

    const propertiesDataPath = `propertiesData.${fieldId}`;

    // A record's value for this field can live in either of two places:
    // the legacy `customFieldsData` array (still written by imports and
    // widget-submitted forms) or the newer `propertiesData` map (written by
    // the record detail page's Properties panel). Both are checked and the
    // used values are unioned. In each shape the stored value is a scalar
    // for select/radio but an array for multiSelect/check, so it is
    // normalized to an array before unwinding rather than matched directly.
    const [fromCustomFieldsData, fromPropertiesData] = await Promise.all([
      model.aggregate([
        { $match: { 'customFieldsData.field': fieldId } },
        { $unwind: '$customFieldsData' },
        { $match: { 'customFieldsData.field': fieldId } },
        {
          $project: {
            value: {
              $cond: [
                { $isArray: '$customFieldsData.value' },
                '$customFieldsData.value',
                ['$customFieldsData.value'],
              ],
            },
          },
        },
        { $unwind: '$value' },
        { $match: { value: { $in: values } } },
        { $group: { _id: '$value' } },
      ]),
      model.aggregate([
        { $match: { [propertiesDataPath]: { $in: values } } },
        {
          $project: {
            value: {
              $cond: [
                { $isArray: `$${propertiesDataPath}` },
                `$${propertiesDataPath}`,
                [`$${propertiesDataPath}`],
              ],
            },
          },
        },
        { $unwind: '$value' },
        { $match: { value: { $in: values } } },
        { $group: { _id: '$value' } },
      ]),
    ]);

    const used = new Set([
      ...fromCustomFieldsData.map((row) => row._id),
      ...fromPropertiesData.map((row) => row._id),
    ]);

    return Array.from(used);
  },
};

fieldQueries.cpFields.wrapperConfig = {
  forClientPortal: true,
};

fieldQueries.cpFieldDetail.wrapperConfig = {
  forClientPortal: true,
};
