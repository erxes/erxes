import { IModels } from '../../../connectionResolver';
import { sendSegmentsMessage } from '../../../messageBroker';

interface IIn {
  $in: string[];
}

export interface IConformityQueryParams {
  conformityMainType?: string;
  conformityMainTypeId?: string;
  conformityRelType?: string;
  conformityIsRelated?: boolean;
  conformityIsSaved?: boolean;
}

export interface IListArgs extends IConformityQueryParams {
  limit?: number;
  segment?: string;
  tag?: string;
  ids?: string[];
  excludeIds?: boolean;
  searchValue?: string;
  brand?: string;
  form?: string;
  startDate?: string;
  endDate?: string;
  leadStatus?: string;
  type?: string;
  only?: string;
  integrationType?: string;
  integration?: string;
  sortField?: string;
  sortDirection?: number;
  popupData?: string;
}

export class Builder {
  public models: IModels;
  public subdomain: string;
  public params: IListArgs;
  public queries = {} as any;

  constructor(models: IModels, subdomain: string, params: IListArgs) {
    this.models = models;
    this.subdomain = subdomain;
    this.params = params;
  }

  public async segmentFilter(segmentId: string): Promise<{ _id: IIn }> {
    const segment = await sendSegmentsMessage({
      subdomain: this.subdomain,
      action: 'findOne',
      data: {
        _id: segmentId
      },
      isRPC: true
    });

    const selector = await sendSegmentsMessage({
      subdomain: this.subdomain,
      action: 'fetchSegment',
      data: {
        segmentId: segment._id,
        returnFields: ['_id'],
        page: 1,
        perPage: this.params.limit ? this.params.limit + 1 : 11,
        sortField: 'updatedAt',
        sortDirection: -1
      },
      isRPC: true
    });

    return {
      _id: { $in: selector }
    };
  }

  /*
   * prepare all queries. do not do any action
   */
  public async buildAllQueries(): Promise<void> {
    this.queries = {
      segments: {}
    };
    if (this.params.segment) {
      this.queries.segments = await this.segmentFilter(this.params.segment);
    }
  }

  public mainQuery(): any {
    return {
      ...this.queries.segments
    };
  }
}
