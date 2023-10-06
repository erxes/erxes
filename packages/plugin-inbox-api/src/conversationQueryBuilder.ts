import * as _ from 'underscore';

import { sendSegmentsMessage, sendTagsMessage } from './messageBroker';

import { CONVERSATION_STATUSES } from './models/definitions/constants';
import { IModels } from './connectionResolver';
import { fixDate } from '@erxes/api-utils/src/core';

interface IIn {
  $in: string[];
}

interface IOR {
  $or: IDateFilter[];
}

interface IExists {
  $exists: boolean;
}

export interface IListArgs {
  limit?: number;
  channelId?: string;
  status?: string;
  unassigned?: string;
  awaitingResponse?: string;
  brandId?: string;
  tag?: string;
  integrationType?: string;
  participating?: string;
  starred?: string;
  ids?: string[];
  startDate?: string;
  endDate?: string;
  only?: string;
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
  segment?: string;
  searchValue?: string;
  skip?: number;
}

interface IUserArgs {
  _id: string;
  code?: string;
  starredConversationIds?: string[];
  role?: string;
}

interface IIntersectIntegrationIds {
  integrationId: IIn;
}

interface IUnassignedFilter {
  assignedUserId: IExists;
}

interface IDateFilter {
  [key: string]: IDate;
}

interface IDate {
  $gte: Date;
  $lte: Date;
}

export default class Builder {
  public models: IModels;
  public subdomain: string;
  public params: IListArgs;
  public user: IUserArgs;
  public queries: any;
  public unassignedQuery?: IUnassignedFilter;
  public activeIntegrationIds: string[] = [];

  constructor(
    models: IModels,
    subdomain: string,
    params: IListArgs,
    user: IUserArgs
  ) {
    this.models = models;
    this.subdomain = subdomain;
    this.params = params;
    this.user = user;
  }

  // filter by segment
  public async segmentFilter(segmentId: string): Promise<{ _id: IIn }> {
    const selector = await sendSegmentsMessage({
      subdomain: this.subdomain,
      action: 'fetchSegment',
      data: {
        segmentId,
        options: {
          returnFields: ['_id'],
          page: 1,
          perPage: this.params.limit ? this.params.limit + 1 : 11,
          sortField: 'updatedAt',
          sortDirection: -1
        }
      },
      isRPC: true
    });

    const Ids = _.pluck(selector, '_id');

    return {
      _id: { $in: Ids }
    };
  }

  public userRelevanceQuery() {
    return [
      { userRelevance: { $exists: false } },
      { userRelevance: new RegExp(this.user.code || '') }
    ];
  }

  public async defaultFilters(): Promise<any> {
    const activeIntegrations = await this.models.Integrations.find({
      isActive: { $ne: false }
    });

    this.activeIntegrationIds = activeIntegrations.map(integ => integ._id);

    let statusFilter = this.statusFilter([
      CONVERSATION_STATUSES.NEW,
      CONVERSATION_STATUSES.OPEN
    ]);

    if (this.params.status === 'closed') {
      statusFilter = this.statusFilter([CONVERSATION_STATUSES.CLOSED]);
    }

    return statusFilter;
  }

  public async intersectIntegrationIds(
    ...queries: any[]
  ): Promise<{ integrationId: IIn }> {
    // filter only queries with $in field
    const withIn = queries.filter(
      q =>
        q.integrationId && q.integrationId.$in && q.integrationId.$in.length > 0
    );

    // [{$in: ['id1', 'id2']}, {$in: ['id3', 'id1', 'id4']}]
    const $ins = _.pluck(withIn, 'integrationId');

    // [['id1', 'id2'], ['id3', 'id1', 'id4']]
    const nestedIntegrationIds = _.pluck($ins, '$in');

    // ['id1']
    const integrationids: string[] = _.intersection(...nestedIntegrationIds);

    return {
      integrationId: { $in: integrationids }
    };
  }

  /*
   * find integrationIds from channel && brand
   */
  public async integrationsFilter(): Promise<IIntersectIntegrationIds> {
    // find all posssible integrations
    let availIntegrationIds: string[] = [];

    const channelQuery =
      this.user.role && this.user.role === 'system'
        ? {}
        : {
            memberIds: this.user._id
          };

    const channels = await this.models.Channels.find(channelQuery);

    if (channels.length === 0) {
      return {
        integrationId: { $in: [] }
      };
    }

    channels.forEach(channel => {
      availIntegrationIds = _.union(
        availIntegrationIds,
        (channel.integrationIds || []).filter(id =>
          this.activeIntegrationIds.includes(id)
        )
      );
    });

    const nestedIntegrationIds: Array<{ integrationId: { $in: string[] } }> = [
      { integrationId: { $in: availIntegrationIds } }
    ];

    // filter by channel
    if (this.params.channelId) {
      const _channelQuery = await this.channelFilter(this.params.channelId);
      nestedIntegrationIds.push(_channelQuery);
    }

    // filter by brand
    if (this.params.brandId) {
      const brandQuery = await this.brandFilter(this.params.brandId);

      if (brandQuery) {
        nestedIntegrationIds.push(brandQuery);
      }
    }

    return this.intersectIntegrationIds(...nestedIntegrationIds);
  }

  // filter by channel
  public async channelFilter(
    channelId: string
  ): Promise<{ integrationId: IIn }> {
    const channel = await this.models.Channels.getChannel(channelId);
    const memberIds = channel.memberIds || [];

    if (!memberIds.includes(this.user._id)) {
      return {
        integrationId: {
          $in: []
        }
      };
    }

    return {
      integrationId: {
        $in: (channel.integrationIds || []).filter(id =>
          this.activeIntegrationIds.includes(id)
        )
      }
    };
  }

  // filter by brand
  public async brandFilter(
    brandId: string
  ): Promise<{ integrationId: IIn } | undefined> {
    const integrations = await this.models.Integrations.findIntegrations({
      brandId
    });

    if (integrations.length === 0) {
      return;
    }

    const integrationIds = _.pluck(integrations, '_id');

    return {
      integrationId: { $in: integrationIds }
    };
  }

  // filter all unassigned
  public unassignedFilter(): IUnassignedFilter {
    this.unassignedQuery = {
      assignedUserId: { $exists: false }
    };

    return this.unassignedQuery;
  }

  // filter by participating
  public participatingFilter(): { $or: object[] } {
    return {
      $or: [
        { participatedUserIds: { $in: [this.user._id] } },
        { assignedUserId: this.user._id }
      ]
    };
  }

  // filter by starred
  public starredFilter(): { _id: IIn | { $in: string[] } } {
    return {
      _id: {
        $in: this.user.starredConversationIds || []
      }
    };
  }

  public statusFilter(statusChoices: string[]): { status: IIn } {
    return {
      status: { $in: statusChoices }
    };
  }

  // filter by awaiting Response
  public awaitingResponse(): { isCustomerRespondedLast: boolean } {
    return {
      isCustomerRespondedLast: true
    };
  }

  // filter by integration type
  public async integrationTypeFilter(
    integrationType: string
  ): Promise<IIntersectIntegrationIds[]> {
    const integrations = await this.models.Integrations.findIntegrations({
      kind: integrationType
    });

    return [
      // add channel && brand filter
      this.queries.integrations,

      // filter by integration type
      { integrationId: { $in: _.pluck(integrations, '_id') } }
    ];
  }

  // filter by tag
  public async tagFilter(tagIds: string[]): Promise<{ tagIds: IIn }> {
    let ids: string[] = [];

    const tags = await sendTagsMessage({
      subdomain: this.subdomain,
      action: 'find',
      data: {
        _id: { $in: tagIds }
      },
      isRPC: true
    });

    for (const tag of tags) {
      ids.push(tag._id);
      ids = ids.concat(tag.relatedIds || []);
    }

    return {
      tagIds: { $in: ids }
    };
  }

  public dateFilter(startDate: string, endDate: string): IOR {
    return {
      $or: [
        {
          createdAt: {
            $gte: fixDate(startDate),
            $lte: fixDate(endDate)
          }
        },
        {
          updatedAt: {
            $gte: fixDate(startDate),
            $lte: fixDate(endDate)
          }
        }
      ]
    };
  }

  public async extendedQueryFilter({ integrationType }: IListArgs) {
    return {
      $and: [
        { $or: this.userRelevanceQuery() },
        ...(integrationType
          ? await this.integrationTypeFilter(integrationType)
          : [])
      ]
    };
  }

  /*
   * prepare all queries. do not do any action
   */
  public async buildAllQueries(): Promise<void> {
    this.queries = {
      default: await this.defaultFilters(),
      starred: {},
      status: {},
      unassigned: {},
      tag: {},
      channel: {},
      integrationType: {},

      // find it using channel && brand
      integrations: {},

      participating: {},
      createdAt: {},
      segments: {}
    };

    // filter by channel
    if (this.params.channelId) {
      this.queries.channel = await this.channelFilter(this.params.channelId);
    }

    // filter by channelId & brandId
    this.queries.integrations = await this.integrationsFilter();

    // unassigned
    if (this.params.unassigned) {
      this.queries.unassigned = this.unassignedFilter();
    }

    // participating
    if (this.params.participating) {
      this.queries.participating = this.participatingFilter();
    }

    // starred
    if (this.params.starred) {
      this.queries.starred = this.starredFilter();
    }

    // awaiting response
    if (this.params.awaitingResponse) {
      this.queries.awaitingResponse = this.awaitingResponse();
    }

    // filter by status
    if (this.params.status) {
      this.queries.status = this.statusFilter([this.params.status]);
    }

    // filter by tag
    if (this.params.tag) {
      this.queries.tag = await this.tagFilter(this.params.tag.split(','));
    }

    if (this.params.startDate && this.params.endDate) {
      this.queries.createdAt = this.dateFilter(
        this.params.startDate,
        this.params.endDate
      );
    }

    // filter by segment
    if (this.params.segment) {
      this.queries.segments = await this.segmentFilter(this.params.segment);
    }

    this.queries.extended = await this.extendedQueryFilter(this.params);
  }

  public mainQuery(): any {
    return {
      ...this.queries.default,
      ...this.queries.integrations,
      ...this.queries.extended,
      ...this.queries.unassigned,
      ...this.queries.participating,
      ...this.queries.status,
      ...this.queries.starred,
      ...this.queries.tag,
      ...this.queries.createdAt,
      ...this.queries.awaitingResponse,
      ...this.queries.segments
    };
  }
}
