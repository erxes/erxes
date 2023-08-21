import { fetchEs } from '@erxes/api-utils/src/elasticsearch';
import { ICustomField } from '@erxes/api-utils/src/types';
import * as _ from 'underscore';
import { debug } from './configs';
import { IModels } from './connectionResolver';
import {
  fetchSegment,
  sendFormsMessage,
  sendSegmentsMessage,
  sendTagsMessage
} from './messageBroker';
import { IProductCategory, productSchema } from './models/definitions/products';

type TSortBuilder = { primaryName: number } | { [index: string]: number };

export interface ICountBy {
  [index: string]: number;
}

export const getEsTypes = () => {
  const schema = productSchema;

  const typesMap: { [key: string]: any } = {};

  schema.eachPath(name => {
    const path = schema.paths[name];
    typesMap[name] = path.options.esType;
  });

  return typesMap;
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

export const countByTag = async (
  subdomain: string,
  type: string,
  qb
): Promise<ICountBy> => {
  const counts: ICountBy = {};

  const tags = await sendTagsMessage({
    subdomain,
    action: 'find',
    data: { type },
    isRPC: true,
    defaultValue: []
  });

  for (const tag of tags) {
    await qb.buildAllQueries();
    await qb.tagFilter(tag._id);

    counts[tag._id] = await qb.runQueries('count');
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

  private contentType: 'products';

  constructor(models: IModels, subdomain: string, params: IListArgs, context) {
    this.contentType = 'products';
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
    return 'product';
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

export const checkCodeMask = async (
  models: IModels,
  category?: IProductCategory,
  code?: string
) => {
  if (!category || !code) {
    return false;
  }

  if (!category || !category.mask || !category.mask.values) {
    return true;
  }

  let maskStr = '';
  const maskList: any[] = [];

  for (const value of category.mask.values || []) {
    if (value.static) {
      maskList.push(value.static);
      continue;
    }

    if (value.type === 'char') {
      maskList.push(value.char);
    }

    if (value.type === 'customField' && value.matches) {
      maskList.push(`(${Object.values(value.matches).join('|')})`);
    }
  }
  maskStr = `${maskList.join('')}\\w+`;

  const mask = new RegExp(maskStr, 'g');

  if (await mask.test(code)) {
    return true;
  }

  return false;
};

export const initCustomField = async (
  subdomain: string,
  category: IProductCategory,
  code: string,
  productCustomFieldsData?: ICustomField[],
  docCustomFieldsData?: ICustomField[]
) => {
  if (!category || !category.mask || !category.mask.values) {
    if (docCustomFieldsData && docCustomFieldsData.length) {
      const docFieldsIds = docCustomFieldsData.map(d => d.field);
      const allCustomFieldsData = docCustomFieldsData.concat(
        (productCustomFieldsData || []).filter(
          d => !docFieldsIds.includes(d.field)
        )
      );

      return await sendFormsMessage({
        subdomain,
        action: 'fields.prepareCustomFieldsData',
        data: allCustomFieldsData,
        isRPC: true,
        defaultValue: []
      });
    }

    return productCustomFieldsData;
  }

  let strInd = 0;
  let customFieldsData: ICustomField[] = [];

  for (const value of category.mask.values || []) {
    const len = Number(value.len);
    if (value.static) {
      strInd += len;
      continue;
    }

    if (value.type === 'customField' && value.matches) {
      const subCode = code.substring(strInd, strInd + len);

      const subCodeInd = Object.values(value.matches).indexOf(subCode);

      customFieldsData.push({
        field: value.fieldId,
        value: Object.keys(value.matches)[subCodeInd]
      });
      strInd += len;
    }
  }

  const codeFieldIds = customFieldsData.map(d => d.field);
  customFieldsData = customFieldsData.concat(
    (docCustomFieldsData || []).filter(d => !codeFieldIds.includes(d.field))
  );

  const withDocFieldIds = customFieldsData.map(d => d.field);
  customFieldsData = customFieldsData.concat(
    (productCustomFieldsData || []).filter(
      d => !withDocFieldIds.includes(d.field)
    )
  );

  return await sendFormsMessage({
    subdomain,
    action: 'fields.prepareCustomFieldsData',
    data: customFieldsData,
    isRPC: true,
    defaultValue: []
  });
};
