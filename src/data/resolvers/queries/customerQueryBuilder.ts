import * as moment from 'moment';
import * as _ from 'underscore';
import { Forms, Integrations, Segments } from '../../../db/models';
import QueryBuilder, { TSegments } from './segmentQueryBuilder';

interface IIn {
  $in: string[];
}
export interface IListArgs {
  page?: number;
  perPage?: number;
  segment?: string;
  tag?: string;
  ids?: string[];
  searchValue?: string;
  brand?: string;
  numberegration?: string;
  form?: string;
  startDate?: string;
  endDate?: string;
  lifecycleState?: string;
  leadStatus?: string;
  sortField?: string;
  sortDirection?: number;
  byFakeSegment?: any;
  integrationType?: string;
  integration?: string;
}
interface IDefaultFilters {
  $nor: [{ [index: string]: IIn | any }];
}
interface IIntegrationIds {
  integrationId: IIn;
}
interface ITagFilter {
  tagIds: IIn;
}
interface IIdsFilter {
  _id: IIn;
}

export default class Builder {
  public params: IListArgs;
  // public user: any;
  public queries: any;

  constructor(params: IListArgs) {
    this.params = params;
    // this.user = user;
  }

  public defaultFilters(): IDefaultFilters {
    const emptySelector = { $in: [null, ''] };

    return {
      $nor: [
        {
          firstName: emptySelector,
          lastName: emptySelector,
          primaryEmail: emptySelector,
          primaryPhone: emptySelector,
          visitorContactInfo: null,
        },
      ],
    };
  }

  // filter by segment
  public async segmentFilter(segmentId: string): Promise<TSegments> {
    const segment = await Segments.findOne({ _id: segmentId });

    return QueryBuilder.segments(segment);
  }

  // filter by brand
  public async brandFilter(brandId: string): Promise<IIntegrationIds> {
    const integrations = await Integrations.find({ brandId });

    return { integrationId: { $in: integrations.map(i => i._id) } };
  }

  // filter by integration kind
  public async integrationTypeFilter(kind: string): Promise<IIntegrationIds> {
    const integrations = await Integrations.find({ kind });

    return { integrationId: { $in: integrations.map(i => i._id) } };
  }

  // filter by integration
  public async integrationFilter(integration: string): Promise<IIntegrationIds> {
    const integrations = await Integrations.find({
      kind: integration,
    });
    /**
     * Since both of brand and integration filters use a same integrationId field
     * we need to intersect two arrays of integration ids.
     */
    const ids = integrations.map(i => i._id);

    const intersectionedIds = this.queries.integrationId ? _.intersection(ids, this.queries.integrationId.$in) : ids;

    return { integrationId: { $in: intersectionedIds } };
  }

  // filter by tagId
  public tagFilter(tagId: string): ITagFilter {
    return { tagIds: { $in: [tagId] } };
  }

  // filter by search value
  public searchFilter(value: string): { $or: any } {
    const fields = [
      { firstName: new RegExp(`.*${value}.*`, 'i') },
      { lastName: new RegExp(`.*${value}.*`, 'i') },
      { emails: { $in: [new RegExp(`.*${value}.*`, 'i')] } },
      { phones: { $in: [new RegExp(`.*${value}.*`, 'i')] } },
      { 'visitorContactInfo.email': new RegExp(`.*${value}.*`, 'i') },
      { 'visitorContactInfo.phone': new RegExp(`.*${value}.*`, 'i') },
    ];

    return { $or: fields };
  }

  // filter by id
  public idsFilter(ids: string[]): IIdsFilter {
    return { _id: { $in: ids } };
  }

  // filter by leadStatus
  public leadStatusFilter(leadStatus: string): { leadStatus: string } {
    return { leadStatus };
  }

  // filter by lifecycleState
  public lifecycleStateFilter(lifecycleState: string): { lifecycleState: string } {
    return { lifecycleState };
  }

  // filter by form
  public async formFilter(formId: string, startDate?: string, endDate?: string): Promise<IIdsFilter> {
    const formObj = await Forms.findOne({ _id: formId });
    const { submissions = [] } = formObj || {};
    const ids: string[] = [];

    for (const submission of submissions) {
      const { customerId, submittedAt } = submission;

      // Collecting customerIds inbetween dates only
      if (startDate && endDate && !ids.includes(customerId)) {
        if (moment(submittedAt).isBetween(startDate, endDate)) {
          ids.push(customerId);
        }

        // If date is not specified collecting all customers
      } else {
        ids.push(customerId);
      }
    }

    return { _id: { $in: ids } };
  }
  /*
   * prepare all queries. do not do any action
   */
  public async buildAllQueries(): Promise<void> {
    this.queries = {
      default: this.defaultFilters(),
      segment: {},
      tag: {},
      ids: {},
      searchValue: {},
      brand: {},
      integration: {},
      form: {},
      integrationType: {},
    };

    // filter by segment
    if (this.params.segment) {
      this.queries.segment = await this.segmentFilter(this.params.segment);
    }

    // filter by tag
    if (this.params.tag) {
      this.queries.tag = this.tagFilter(this.params.tag);
    }

    // filter by brand
    if (this.params.brand) {
      this.queries.brand = await this.brandFilter(this.params.brand);
    }

    // filter by integration kind
    if (this.params.integrationType) {
      this.queries.integrationType = await this.integrationTypeFilter(this.params.integrationType);
    }

    // filter by form
    if (this.params.form) {
      this.queries.form = await this.formFilter(this.params.form);

      if (this.params.startDate && this.params.endDate) {
        this.queries.form = await this.formFilter(this.params.form, this.params.startDate, this.params.endDate);
      }
    }

    /* If there are ids and form params, returning ids filter only
     * filter by ids
     */
    if (this.params.ids) {
      this.queries.ids = this.idsFilter(this.params.ids);
    }

    // filter by integration
    if (this.params.integration) {
      this.queries.integration = await this.integrationFilter(this.params.integration);
    }

    // filter by search value
    if (this.params.searchValue) {
      this.queries.searchValue = this.searchFilter(this.params.searchValue);
    }

    // filter by leadStatus
    if (this.params.leadStatus) {
      this.queries.leadStatus = this.leadStatusFilter(this.params.leadStatus);
    }

    // filter by lifecycleState
    if (this.params.lifecycleState) {
      this.queries.lifecycleState = this.lifecycleStateFilter(this.params.lifecycleState);
    }
  }

  public mainQuery(): any {
    return {
      ...this.queries.default,
      ...this.queries.segment,
      ...this.queries.tag,
      ...this.queries.segment,
      ...this.queries.brand,
      ...this.queries.integrationType,
      ...this.queries.form,
      ...this.queries.ids,
      ...this.queries.integration,
      ...this.queries.searchValue,
      ...this.queries.leadStatus,
      ...this.queries.lifecycleState,
    };
  }
}
