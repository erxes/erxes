import {
  buildUserRelevanceQueries,
  buildParticipatingQuery,
  buildDateQueries,
} from '@/inbox/utils/conversationCountFilters';
import * as _ from 'underscore';
import { CONVERSATION_STATUSES } from '@/inbox/db/definitions/constants';
import { IListArgs } from '~/conversationQueryBuilder';
import { IModels } from '~/connectionResolvers';
import { type IUserArgs } from '@/inbox/@types/conversationCounts';

export class CommonBuilder<IArgs extends IListArgs> {
  public models: IModels;
  public subdomain: string;
  public params: IArgs;
  public user: IUserArgs;
  public integrationIds: string[];
  public positiveList: Record<string, unknown>[];
  public filterList: Record<string, unknown>[];
  public activeIntegrationIds: string[] = [];

  constructor(
    models: IModels,
    subdomain: string,
    params: IArgs,
    integrationIds: string[],
    user: IUserArgs,
  ) {
    this.models = models;
    this.subdomain = subdomain;
    this.params = params;
    this.user = user;
    this.integrationIds = integrationIds;

    this.positiveList = [];
    this.filterList = [];

    this.resetPositiveList();
    this.defaultFilters();
  }

  // filter by segment

  public resetPositiveList() {
    this.positiveList = buildUserRelevanceQueries(this.user.code);
  }

  public async defaultFilters(): Promise<void> {
    this.filterList = [
      {
        terms: {
          'integrationId.keyword': this.integrationIds,
        },
      },
    ];

    // filter by status
    if (this.params.status === 'closed') {
      this.statusFilter([CONVERSATION_STATUSES.CLOSED]);
    } else {
      this.statusFilter([
        CONVERSATION_STATUSES.NEW,
        CONVERSATION_STATUSES.OPEN,
      ]);
    }

    if (this.params.integrationType) {
      await this.integrationTypeFilter(this.params.integrationType);
    }

    const activeIntegrations = await this.models.Integrations.findIntegrations(
      {},
      { _id: 1 },
    );

    this.activeIntegrationIds = activeIntegrations.map((integ) => integ._id);
  }

  public async channelFilter(channelId: string): Promise<void> {
    const isMember = await this.models.ChannelMembers.exists({
      channelId,
      memberId: this.user._id,
    });

    if (!isMember) {
      return;
    }

    const integrations = await this.models.Integrations.find({
      channelId,
    }).lean();

    const integrationIds = integrations
      .map((i) => i._id.toString())
      .filter((id) => this.activeIntegrationIds.includes(id));

    if (integrationIds.length > 0) {
      this.filterList.push({
        terms: {
          'integrationId.keyword': integrationIds,
        },
      });
    }
  }

  public integrationNotFound() {
    this.filterList.push({
      match: {
        integrationId: 'integrationNotFound',
      },
    });
  }

  // filter by brand
  public async brandFilter(brandId: string) {
    const integrations = await this.models.Integrations.findIntegrations({
      brandId,
    }).select('_id');

    if (integrations.length === 0) {
      this.integrationNotFound();
      return;
    }

    const integrationIds: string[] = _.intersection(
      this.integrationIds,
      _.pluck(integrations, '_id'),
    );

    if (integrationIds.length === 0) {
      this.integrationNotFound();
      return;
    }

    this.filterList.push({
      terms: {
        'integrationId.keyword': integrationIds,
      },
    });
  }

  // filter all unassigned
  public unassignedFilter() {
    this.filterList.push({
      bool: {
        must_not: [
          {
            exists: {
              field: 'assignedUserId',
            },
          },
        ],
      },
    });
  }

  // filter by participating
  public participatingFilter() {
    this.filterList.push(buildParticipatingQuery(this.user._id));
  }

  // filter by starred
  public starredFilter() {
    this.filterList.push({
      terms: {
        _id: this.user.starredConversationIds || [],
      },
    });
  }

  // status filter
  public statusFilter(statusChoices: string[]) {
    this.filterList.push({
      terms: {
        status: statusChoices,
      },
    });
  }

  // filter by awaiting Response
  public awaitingResponse() {
    this.filterList.push({
      match: {
        isCustomerRespondedLast: true,
      },
    });
  }

  // filter by tagId
  public tagFilter(tagId: string) {
    this.filterList.push({
      match: {
        tagIds: tagId,
      },
    });
  }

  public async dateFilter(startDate: string, endDate: string) {
    this.positiveList.push(...buildDateQueries(startDate, endDate));
  }

  // filter by integration type
  public async integrationTypeFilter(integrationType: string) {
    const integrations = await this.models.Integrations.findIntegrations({
      kind: integrationType,
    });

    this.filterList.push({
      terms: {
        'integrationId.keyword': _.pluck(integrations, '_id'),
      },
    });
  }

  // Restrict to a single integration (e.g. one Discord channel) by id.
  public integrationFilter(integrationId: string) {
    this.filterList.push({
      terms: {
        'integrationId.keyword': [integrationId],
      },
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
          'tagIds.keyword': tagIds,
        },
      });
    }

    if (this.params.startDate && this.params.endDate) {
      await this.dateFilter(this.params.startDate, this.params.endDate);
    }
  }

  /**
   * The counts were read from an Elasticsearch `conversations` index this
   * deployment never had - the call already resolved to nothing, so every
   * count has been empty. The clause builders above are kept as the seam a
   * Mongo implementation fills; until then the answer is honestly zero.
   */
  public async runQueries(): Promise<number> {
    return 0;
  }
}
