import { fetchEs } from "@erxes/api-utils/src/elasticsearch";
import * as _ from "underscore";
import { debugError } from "@erxes/api-utils/src/debuggers";
import { productSchema } from "../../../db/models/definitions/products";
import { IModels } from "../../../connectionResolver";
import { fetchSegment } from "../segments/queryBuilder";

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

export const countBySegmentProduct = async (
  models: IModels,
  contentType: string,
  qb
): Promise<ICountBy> => {
  const counts: ICountBy = {};

  const segments = await models.Segments.find({
    contentType,
    name: { $exists: true }
  });

  for (const s of segments) {
    try {
      await qb.buildAllQueries();
      await qb.segmentFilter(s);
      counts[s._id] = await qb.runQueries("count");
    } catch (e) {
      debugError(`Error during segment count ${e.message}`);
      counts[s._id] = 0;
    }
  }

  return counts;
};

export const countByTagProduct = async (
  models: IModels,
  type: string,
  qb
): Promise<ICountBy> => {
  const counts: ICountBy = {};

  const tags = await models.Tags.find({ type });

  for (const tag of tags) {
    await qb.buildAllQueries();
    await qb.tagFilter(tag._id);

    counts[tag._id] = await qb.runQueries("count");
  }

  return counts;
};

export interface IListArgs {
  segment?: string;
  segmentData?: string;
}

export class ProductQueriesBuilder {
  public params: IListArgs;
  public context;
  public positiveList: any[];
  public negativeList: any[];
  public models: IModels;
  public subdomain: string;

  private contentType: "products";

  constructor(models: IModels, subdomain: string, params: IListArgs, context) {
    this.contentType = "products";
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
    this.negativeList = [{ term: { status: "deleted" } }];
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
      this.models,
      this.subdomain,
      segmentData ? segmentData : segment,
      { returnSelector: true }
    );

    this.positiveList = [...this.positiveList, selector];
  }

  public getRelType() {
    return "product";
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
      const segment = await this.models.Segments.findOne({
        _id: this.params.segment
      });

      await this.segmentFilter(segment);
    }
  }

  public async runQueries(action = "search"): Promise<any> {
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
      action: "count",
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
