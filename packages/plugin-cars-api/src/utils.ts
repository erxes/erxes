import { fetchEs } from '@erxes/api-utils/src/elasticsearch';
import { generateFieldsFromSchema } from '@erxes/api-utils/src';
import * as _ from 'underscore';
import { generateModels, IModels } from './connectionResolver';
import { fetchSegment, sendSegmentsMessage } from './messageBroker';
import { debug } from './configs';

export interface ICountBy {
  [index: string]: number;
}

const gatherNames = async params => {
  const {
    collection,
    idFields,
    foreignKey,
    prevList,
    nameFields = []
  } = params;
  let options = [] as any;

  if (prevList && prevList.length > 0) {
    options = prevList;
  }

  const uniqueIds = _.compact(_.uniq(idFields));

  for (const id of uniqueIds) {
    const item = await collection.findOne({ _id: id });
    let name: string = `item with id "${id}" has been deleted`;

    if (item) {
      for (const n of nameFields) {
        if (item[n]) {
          name = item[n];
        }
      }
    }

    options.push({ [foreignKey]: id, name });
  }

  return options;
};

const gatherCarFieldNames = async (models, doc, prevList = null) => {
  let options = [];

  if (prevList) {
    options = prevList;
  }

  if (doc.categoryId) {
    options = await gatherNames({
      collection: models.CarCategories,
      idFields: [doc.categoryId],
      foreignKey: 'categoryId',
      prevList: options,
      nameFields: ['name']
    });
  }

  return options;
};

export const gatherDescriptions = async params => {
  const { action, obj, type, updatedDocument, extraParams } = params;
  const { models } = extraParams;

  let extraDesc = [] as any;
  let description = '';

  switch (type) {
    case 'car': {
      description = `${obj.plateNumber || obj.vinNumber} has been ${action}d`;

      extraDesc = await gatherCarFieldNames(models, obj);

      if (updatedDocument) {
        extraDesc = await gatherCarFieldNames(
          models,
          updatedDocument,
          extraDesc
        );
      }
      break;
    }
    case 'car-category': {
      description = `"${obj.name}" has been ${action}d`;

      const parentIds: string[] = [];

      if (obj.parentId) {
        parentIds.push(obj.parentId);
      }

      if (updatedDocument && updatedDocument.parentId !== obj.parentId) {
        parentIds.push(updatedDocument.parentId);
      }

      if (parentIds.length > 0) {
        extraDesc = await gatherNames({
          collection: models.CarCategories,
          idFields: parentIds,
          foreignKey: 'parentId',
          nameFields: ['name']
        });
      }
    }
    default:
      break;
  }
  return { extraDesc, description };
};

export const generateFields = async ({ subdomain }) => {
  const models = await generateModels(subdomain);

  const { Cars } = models;

  const schema = Cars.schema as any;
  let fields: Array<{
    _id: number;
    name: string;
    group?: string;
    label?: string;
    type?: string;
    validation?: string;
    options?: string[];
    selectOptions?: Array<{ label: string; value: string }>;
  }> = [];

  if (schema) {
    // generate list using customer or company schema
    fields = [...fields, ...(await generateFieldsFromSchema(schema, ''))];

    for (const name of Object.keys(schema.paths)) {
      const path = schema.paths[name];

      // extend fields list using sub schema fields
      if (path.schema) {
        fields = [
          ...fields,
          ...(await generateFieldsFromSchema(path.schema, `${name}.`))
        ];
      }
    }
  }

  fields = fields.filter(field => {
    if (
      field.name === 'parentCarCategoryId' ||
      field.name === 'carCategoryId'
    ) {
      return false;
    }

    return true;
  });

  const parentCategories = await models.CarCategories.find({
    $or: [{ parentId: null }, { parentId: '' }]
  });

  const categories = await models.CarCategories.find({
    $or: [{ parentId: { $ne: null } }, { parentId: { $ne: '' } }]
  });

  const additionalFields = [
    {
      _id: Math.random(),
      name: 'parentCarCategoryId',
      label: 'Category',
      type: 'String',
      selectOptions: parentCategories.map(category => ({
        value: category._id,
        label: category.name
      }))
    },
    {
      _id: Math.random(),
      name: 'carCategoryId',
      label: 'Sub category',
      type: 'String',
      selectOptions: categories.map(category => ({
        value: category._id,
        label: category.name
      }))
    },
    {
      _id: Math.random(),
      name: 'drivers',
      label: 'Driver(s)',
      type: 'String',
      selectOptions: undefined
    },
    {
      _id: Math.random(),
      name: 'companies',
      label: 'Company(s)',
      type: 'String',
      selectOptions: undefined
    }
  ];

  return [...additionalFields, ...fields];
};

export const countBySegment = async (
  subdomain: string,
  contentType: string,
  qb
): Promise<ICountBy> => {
  const counts: ICountBy = {};

  let segments: any[] = [];

  segments = await sendSegmentsMessage({
    subdomain,
    action: 'find',
    data: { contentType, name: { $exists: true } },
    isRPC: true,
    defaultValue: []
  });

  for (const s of segments) {
    try {
      await qb.buildAllQueries();
      await qb.segmentFilter(s);
      counts[s._id] = await qb.runQueries('count');
    } catch (e) {
      debug.error(`Error during segment count ${e.message}`);
      counts[s._id] = 0;
    }
  }

  return counts;
};

export interface IListArgs {
  segment?: string;
  segmentData?: string;
}

export class Builder {
  public params: IListArgs;
  public context;
  public positiveList: any[];
  public negativeList: any[];
  public models: IModels;
  public subdomain: string;

  private contentType: 'cars';

  constructor(models: IModels, subdomain: string, params: IListArgs, context) {
    this.contentType = 'cars';
    this.context = context;
    this.params = params;
    this.models = models;
    this.subdomain = subdomain;

    this.positiveList = [];
    this.negativeList = [];

    this.resetPositiveList();
    this.resetNegativeList();
  }

  public resetNegativeList() {
    this.negativeList = [{ term: { status: 'deleted' } }];
  }

  public resetPositiveList() {
    this.positiveList = [];

    if (this.context.commonQuerySelectorElk) {
      this.positiveList.push(this.context.commonQuerySelectorElk);
    }
  }

  // filter by segment
  public async segmentFilter(segment: any, segmentData?: any) {
    const selector = await fetchSegment(
      this.subdomain,
      segment._id,
      { returnSelector: true },
      segmentData
    );

    this.positiveList = [...this.positiveList, selector];
  }

  public getRelType() {
    return 'car';
  }

  /*
   * prepare all queries. do not do any action
   */
  public async buildAllQueries(): Promise<void> {
    this.resetPositiveList();
    this.resetNegativeList();

    // filter by segment data
    if (this.params.segmentData) {
      const segment = JSON.parse(this.params.segmentData);

      await this.segmentFilter({}, segment);
    }

    // filter by segment
    if (this.params.segment) {
      const segment = await sendSegmentsMessage({
        isRPC: true,
        action: 'findOne',
        subdomain: this.subdomain,
        data: { _id: this.params.segment }
      });

      await this.segmentFilter(segment);
    }
  }

  public async runQueries(action = 'search'): Promise<any> {
    const queryOptions: any = {
      query: {
        bool: {
          must: this.positiveList,
          must_not: this.negativeList
        }
      }
    };

    let totalCount = 0;

    const totalCountResponse = await fetchEs({
      subdomain: this.subdomain,
      action: 'count',
      index: this.contentType,
      body: queryOptions,
      defaultValue: 0
    });

    totalCount = totalCountResponse.count;

    const response = await fetchEs({
      subdomain: this.subdomain,
      action,
      index: this.contentType,
      body: queryOptions
    });

    const list = response.hits.hits.map(hit => {
      return {
        _id: hit._id,
        ...hit._source
      };
    });

    return {
      list,
      totalCount
    };
  }
}
