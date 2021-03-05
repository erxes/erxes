import * as _ from 'underscore';
import {
  Brands,
  Channels,
  Conversations,
  Integrations,
  Tags
} from '../../../db/models';
import { CONVERSATION_STATUSES } from '../../../db/models/definitions/constants';
import { KIND_CHOICES } from '../../../db/models/definitions/constants';
import { fetchElk } from '../../../elasticsearch';
import { IListArgs } from '../../resolvers/queries/conversationQueryBuilder';
import { fixDate } from '../../utils';

export interface ICountBy {
  [index: string]: number;
}

interface IUserArgs {
  _id: string;
  code?: string;
  starredConversationIds?: string[];
}

// Count conversatio  by channel
const countByChannels = async (
  qb: any,
  counts: ICountBy
): Promise<ICountBy> => {
  const channels = await Channels.find();

  for (const channel of channels) {
    await qb.buildAllQueries();
    await qb.channelFilter(channel._id);

    counts[channel._id] = await qb.runQueries();
  }

  return counts;
};

// Count conversation by brand
const countByBrands = async (qb: any, counts: ICountBy): Promise<ICountBy> => {
  const brands = await Brands.find({});

  for (const brand of brands) {
    await qb.buildAllQueries();
    await qb.brandFilter(brand._id);

    counts[brand._id] = await qb.runQueries();
  }

  return counts;
};

// Count converstaion by tag
const countByTags = async (qb: any, counts: ICountBy): Promise<ICountBy> => {
  const tags = await Tags.find({ type: 'conversation' }).select('_id');

  for (const tag of tags) {
    await qb.buildAllQueries();
    await qb.tagFilter(tag._id);

    counts[tag._id] = await qb.runQueries();
  }

  return counts;
};

// Count conversation by integration
const countByIntegrationTypes = async (
  qb: any,
  counts: ICountBy
): Promise<ICountBy> => {
  for (const type of KIND_CHOICES.ALL) {
    await qb.buildAllQueries();
    await qb.integrationTypeFilter(type);

    counts[type] = await qb.runQueries();
  }

  return counts;
};

export const countByConversations = async (
  params: IListArgs,
  integrationIds: string[],
  user: IUserArgs,
  only: string
): Promise<ICountBy> => {
  const counts: ICountBy = {};

  const qb = new CommonBuilder(params, integrationIds, user);

  switch (only) {
    case 'byChannels':
      await countByChannels(qb, counts);
      break;

    case 'byIntegrationTypes':
      await countByIntegrationTypes(qb, counts);
      break;

    case 'byBrands':
      await countByBrands(qb, counts);
      break;

    case 'byTags':
      await countByTags(qb, counts);
      break;
  }

  return counts;
};

export class CommonBuilder<IArgs extends IListArgs> {
  public params: IArgs;
  public user: IUserArgs;
  public integrationIds: string[];
  public positiveList: any[];
  public filterList: any[];
  public activeIntegrationIds: string[] = [];

  constructor(params: IArgs, integrationIds: string[], user: IUserArgs) {
    this.params = params;
    this.user = user;
    this.integrationIds = integrationIds;

    this.positiveList = [];
    this.filterList = [];

    this.resetPositiveList();
    this.defaultFilters();
  }

  public resetPositiveList() {
    const defaultUserQuery = [
      {
        exists: {
          field: 'userId'
        }
      },
      {
        range: {
          messageCount: { gt: 1 }
        }
      },
      {
        bool: {
          must_not: [
            {
              exists: {
                field: 'userId'
              }
            }
          ]
        }
      }
    ];

    const userRelevanceQuery = [
      {
        regexp: {
          userRelevance: `${this.user.code}..`
        }
      },
      {
        bool: {
          must_not: [
            {
              exists: {
                field: 'userRelevance'
              }
            }
          ]
        }
      }
    ];

    this.positiveList = [
      { bool: { should: userRelevanceQuery } },
      { bool: { should: defaultUserQuery } }
    ];
  }

  public async defaultFilters(): Promise<any> {
    this.filterList = [
      {
        terms: {
          'integrationId.keyword': this.integrationIds
        }
      }
    ];

    // filter by status
    if (this.params.status === 'closed') {
      this.statusFilter([CONVERSATION_STATUSES.CLOSED]);
    } else {
      this.statusFilter([
        CONVERSATION_STATUSES.NEW,
        CONVERSATION_STATUSES.OPEN
      ]);
    }

    if (this.params.integrationType) {
      await this.integrationTypeFilter(this.params.integrationType);
    }

    const activeIntegrations = await Integrations.findIntegrations(
      {},
      { _id: 1 }
    );

    this.activeIntegrationIds = activeIntegrations.map(integ => integ._id);
  }

  // filter by channel
  public async channelFilter(channelId: string): Promise<void> {
    const channel = await Channels.getChannel(channelId);
    const memberIds = channel.memberIds || [];

    if (!memberIds.includes(this.user._id)) {
      return;
    }

    this.filterList.push({
      terms: {
        'integrationId.keyword': (channel.integrationIds || []).filter(id =>
          this.activeIntegrationIds.includes(id)
        )
      }
    });
  }

  public integrationNotFound() {
    this.filterList.push({
      match: {
        integrationId: 'integrationNotFound'
      }
    });
  }

  // filter by brand
  public async brandFilter(brandId: string) {
    const integrations = await Integrations.findIntegrations({
      brandId
    }).select('_id');

    if (integrations.length === 0) {
      this.integrationNotFound();
      return;
    }

    const integrationIds: string[] = _.intersection(
      this.integrationIds,
      _.pluck(integrations, '_id')
    );

    if (integrationIds.length === 0) {
      this.integrationNotFound();
      return;
    }

    this.filterList.push({
      terms: {
        'integrationId.keyword': integrationIds
      }
    });
  }

  // filter all unassigned
  public unassignedFilter() {
    this.filterList.push({
      bool: {
        must_not: [
          {
            exists: {
              field: 'assignedUserId'
            }
          }
        ]
      }
    });
  }

  // filter by participating
  public participatingFilter() {
    this.filterList.push({
      bool: {
        should: [
          {
            match: {
              participatedUserIds: this.user._id
            }
          },
          {
            match: {
              assignedUserId: this.user._id
            }
          }
        ]
      }
    });
  }

  // filter by starred
  public starredFilter() {
    this.filterList.push({
      terms: {
        _id: this.user.starredConversationIds || []
      }
    });
  }

  // status filter
  public statusFilter(statusChoices: string[]) {
    this.filterList.push({
      terms: {
        status: statusChoices
      }
    });
  }

  // filter by awaiting Response
  public awaitingResponse() {
    this.filterList.push({
      match: {
        isCustomerRespondedLast: true
      }
    });
  }

  // filter by tagId
  public tagFilter(tagId: string) {
    this.filterList.push({
      match: {
        tagIds: tagId
      }
    });
  }

  public async dateFilter(startDate: string, endDate: string) {
    const conversations = await Conversations.find({
      createdAt: {
        $gte: fixDate(startDate),
        $lte: fixDate(endDate)
      }
    }).select('_id');

    this.filterList.push({
      terms: {
        _id: conversations.map(conv => {
          return conv._id;
        })
      }
    });
  }

  // filter by integration type
  public async integrationTypeFilter(integrationType: string) {
    const integrations = await Integrations.findIntegrations({
      kind: integrationType
    });

    this.filterList.push({
      terms: {
        'integrationId.keyword': _.pluck(integrations, '_id')
      }
    });
  }

  /*
   * prepare all queries. do not do any action
   */
  public async buildAllQueries(): Promise<void> {
    this.resetPositiveList();

    await this.defaultFilters();

    // filter by channel
    if (this.params.channelId) {
      await this.channelFilter(this.params.channelId);
    }

    // unassigned
    if (this.params.unassigned) {
      this.unassignedFilter();
    }

    // participating
    if (this.params.participating) {
      this.participatingFilter();
    }

    // starred
    if (this.params.starred) {
      this.starredFilter();
    }

    // awaiting response
    if (this.params.awaitingResponse) {
      this.awaitingResponse();
    }

    // filter by tag
    if (this.params.tag) {
      const tagIds = this.params.tag.split(',');

      this.filterList.push({
        terms: {
          'tagIds.keyword': tagIds
        }
      });
    }

    if (this.params.startDate && this.params.endDate) {
      await this.dateFilter(this.params.startDate, this.params.endDate);
    }
  }

  /*
   * Run queries
   */
  public async runQueries(): Promise<any> {
    const queryOptions: any = {
      query: {
        bool: {
          must: this.positiveList,
          filter: this.filterList
        }
      }
    };

    const response = await fetchElk(
      'count',
      'conversations',
      queryOptions,
      '',
      0
    );

    return response.count;
  }
}
