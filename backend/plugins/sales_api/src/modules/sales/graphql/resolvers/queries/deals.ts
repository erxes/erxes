import { CLOSE_DATE_TYPES, SALES_STATUSES } from '~/modules/sales/constants';
import {
  IArchiveArgs,
  IDealDocument,
  IDealQueryParams,
} from '~/modules/sales/@types';
import { IContext, IModels } from '~/connectionResolvers';
import {
  archivedItems,
  archivedItemsCount,
  checkItemPermByUser,
  getItemList,
} from '~/modules/sales/utils';
import {
  checkPermission,
  moduleRequireLogin,
} from 'erxes-api-shared/core-modules';
import {
  getNextMonth,
  getToday,
  regexSearchText,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';

import { FilterQuery } from 'mongoose';
import dealResolvers from '../customResolvers/deal';
import moment from 'moment';
import { fetchSegment } from '~/modules/sales/trpc/deal';

const contains = (values: string[]) => {
  return { $in: values };
};

const isListEmpty = (value) => {
  return value.length === 1 && value[0].length === 0;
};

export const generateFilter = async (
  models: IModels,
  subdomain: string,
  userId: string,
  params: any = {},
) => {
  const filter: FilterQuery<IDealDocument> = {};

  const {
    _ids,
    pipelineId,
    pipelineIds,
    stageId,
    parentId,
    boardIds,
    stageCodes,
    search,
    closeDateType,
    assignedUserIds,
    customerIds,
    vendorCustomerIds,
    companyIds,
    relationType,
    relationId,
    initialStageId,
    labelIds,
    priority,
    userIds,
    tagIds,
    segment,
    segmentData,
    assignedToMe,
    startDate,
    endDate,
    hasStartAndCloseDate,
    stageChangedStartDate,
    stageChangedEndDate,
    noSkipArchive,
    number,
    branchIds,
    departmentIds,
    dateRangeFilters,
    resolvedDayBetween,
    productIds,
    date,
    createdStartDate,
    createdEndDate,
    stateChangedStartDate,
    stateChangedEndDate,
    startDateStartDate,
    startDateEndDate,
    closeDateStartDate,
    closeDateEndDate,
    source,
  } = params;
  Object.assign(
    filter,
    noSkipArchive
      ? {}
      : { status: { $ne: SALES_STATUSES.ARCHIVED }, parentId: undefined },
  );

  let filterIds: string[] = [];

  if (parentId) {
    filter.parentId = parentId;
  }

  if (source) {
    filter.source = contains(source);
  }

  if (assignedUserIds) {
    // Filter by assigned to no one
    const notAssigned = isListEmpty(assignedUserIds);

    filter.assignedUserIds = notAssigned ? [] : { $in: assignedUserIds };
  }

  if (branchIds) {
    const branches = await sendTRPCMessage({
      subdomain,

      pluginName: 'core',
      method: 'query',
      module: 'branches',
      action: 'findWithChild',
      input: {
        query: { _id: { $in: branchIds } },
        fields: { _id: 1 },
      },
      defaultValue: [],
    });

    filter.branchIds = { $in: branches.map((item) => item._id) };
  }

  if (departmentIds) {
    const departments = await sendTRPCMessage({
      subdomain,

      pluginName: 'core',
      method: 'query',
      module: 'departments',
      action: 'findWithChild',
      input: {
        query: { _id: { $in: departmentIds } },
        fields: { _id: 1 },
      },
      defaultValue: [],
    });

    filter.departmentIds = { $in: departments.map((item) => item._id) };
  }

  if (customerIds) {
    const relIds = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'relation',
      action: 'filterRelationIds',
      input: {
        contentType: 'core:customer',
        contentIds: customerIds,
        relatedContentType: 'sales:deal'
      },
      defaultValue: []
    });

    filterIds = relIds;
  }

  if (companyIds) {
    const relIds = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'relation',
      action: 'filterRelationIds',
      input: {
        contentType: 'core:company',
        contentIds: companyIds,
        relatedContentType: 'sales:deal'
      },
      defaultValue: []
    });

    filterIds = filterIds.length
      ? filterIds.filter((id) => relIds.includes(id))
      : relIds;
  }

  if (customerIds || companyIds) {
    filter._id = { $in: filterIds };
  }

  if (_ids?.length) {
    filter._id = { $in: _ids };
  }

  if (relationType && relationId) {
    const relIds = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'relation',
      action: 'getRelationIds',
      input: {
        contentType: relationType,
        contentId: relationId,
        relatedContentType: 'sales:deal'
      }
    });
    filter._id = contains(relIds || []);
  }

  if (initialStageId) {
    filter.initialStageId = initialStageId;
  }

  if (closeDateType) {
    if (closeDateType === CLOSE_DATE_TYPES.NEXT_DAY) {
      const tomorrow = moment().add(1, 'days');

      filter.closeDate = {
        $gte: new Date(tomorrow.startOf('day').toISOString()),
        $lte: new Date(tomorrow.endOf('day').toISOString()),
      };
    }

    if (closeDateType === CLOSE_DATE_TYPES.NEXT_WEEK) {
      const monday = moment()
        .day(1 + 7)
        .format('YYYY-MM-DD');
      const nextSunday = moment()
        .day(7 + 7)
        .format('YYYY-MM-DD');

      filter.closeDate = {
        $gte: new Date(monday),
        $lte: new Date(nextSunday),
      };
    }

    if (closeDateType === CLOSE_DATE_TYPES.NEXT_MONTH) {
      const now = new Date();
      const { start, end } = getNextMonth(now);

      filter.closeDate = {
        $gte: new Date(start),
        $lte: new Date(end),
      };
    }

    if (closeDateType === CLOSE_DATE_TYPES.NO_CLOSE_DATE) {
      filter.closeDate = { $exists: false };
    }

    if (closeDateType === CLOSE_DATE_TYPES.OVERDUE) {
      const now = new Date();
      const today = getToday(now);

      filter.closeDate = { $lt: today };
    }
  }

  if (startDate) {
    filter.closeDate = {
      $gte: new Date(startDate),
    };
  }

  if (endDate) {
    if (filter.closeDate) {
      filter.closeDate.$lte = new Date(endDate);
    } else {
      filter.closeDate = {
        $lte: new Date(endDate),
      };
    }
  }

  if (dateRangeFilters) {
    for (const dateRangeFilter of dateRangeFilters) {
      const { name, from, to } = dateRangeFilter;

      if (from) {
        filter[name] = { $gte: new Date(from) };
      }

      if (to) {
        filter[name] = { ...filter[name], $lte: new Date(to) };
      }
    }
  }

  const stageChangedDateFilter: any = {};
  if (stageChangedStartDate) {
    stageChangedDateFilter.$gte = new Date(stageChangedStartDate);
  }
  if (stageChangedEndDate) {
    stageChangedDateFilter.$lte = new Date(stageChangedEndDate);
  }
  if (Object.keys(stageChangedDateFilter).length) {
    filter.stageChangedDate = stageChangedDateFilter;
  }

  if (search) {
    Object.assign(filter, regexSearchText(search));
  }

  if (stageId) {
    filter.stageId = stageId;
  } else if (pipelineId || pipelineIds) {
    let filterPipeline: any = pipelineId;

    if (pipelineIds) {
      filterPipeline = { $in: pipelineIds };
    }

    const stageIds = await models.Stages.find({
      pipelineId: filterPipeline,
      status: { $ne: SALES_STATUSES.ARCHIVED },
    }).distinct('_id');

    filter.stageId = { $in: stageIds };
  }

  if (boardIds) {
    const pipelineIds = await models.Pipelines.find({
      boardId: { $in: boardIds },
      status: { $ne: SALES_STATUSES.ARCHIVED },
    }).distinct('_id');

    const filterStages: any = {
      pipelineId: { $in: pipelineIds },
      status: { $ne: SALES_STATUSES.ARCHIVED },
    };

    if (filter?.stageId?.$in) {
      filterStages._id = { $in: filter?.stageId?.$in };
    }

    const stageIds = await models.Stages.find(filterStages).distinct('_id');

    filter.stageId = { $in: stageIds };
  }

  if (stageCodes) {
    const filterStages: any = { code: { $in: stageCodes } };

    if (filter?.stageId?.$in) {
      filterStages._id = { $in: filter?.stageId?.$in };
    }

    const stageIds = await models.Stages.find(filterStages).distinct('_id');

    filter.stageId = { $in: stageIds };
  }

  if (labelIds) {
    const isEmpty = isListEmpty(labelIds);

    filter.labelIds = isEmpty ? { $in: [null, []] } : { $in: labelIds };
  }

  if (priority) {
    filter.priority = { $in: priority };
  }

  if (tagIds) {
    filter.tagIds = { $in: tagIds };
  }

  if (pipelineId) {
    const pipeline = await models.Pipelines.getPipeline(pipelineId);

    const user = await sendTRPCMessage({
      subdomain,

      pluginName: 'core',
      method: 'query',
      module: 'users',
      action: 'findOne',
      input: {
        _id: userId,
      },
    });

    const departments = await sendTRPCMessage({
      subdomain,

      pluginName: 'core',
      method: 'query',
      module: 'departments',
      action: 'findWithChild',
      input: {
        _id: userId,
      },
      defaultValue: [],
    });

    const supervisorDepartmentIds = departments?.map((x) => x._id) || [];
    const pipelineDepartmentIds = pipeline.departmentIds || [];

    const commonIds =
      supervisorDepartmentIds.filter((id) =>
        pipelineDepartmentIds.includes(id),
      ) || [];
    const isEligibleSeeAllCards = (pipeline.excludeCheckUserIds || []).includes(
      userId,
    );
    if (
      commonIds?.length > 0 &&
      (pipeline.isCheckUser || pipeline.isCheckDepartment) &&
      !isEligibleSeeAllCards
    ) {
      // current user is supervisor in departments and this pipeline has included that some of user's departments
      // so user is eligible to see all cards of people who share same department.
      const otherDepartmentUsers = await sendTRPCMessage({
        subdomain,

        pluginName: 'core',
        method: 'query',
        module: 'users',
        action: 'find',
        input: {
          query: { departmentIds: { $in: commonIds } },
        },
        defaultValue: [],
      });

      let includeCheckUserIds = otherDepartmentUsers.map((x) => x._id) || [];
      includeCheckUserIds = includeCheckUserIds.concat(user._id || []);

      const uqinueCheckUserIds = [
        ...new Set(includeCheckUserIds.concat(userId)),
      ];

      Object.assign(filter, {
        $or: [
          { assignedUserIds: { $in: uqinueCheckUserIds } },
          { userId: { $in: uqinueCheckUserIds } },
        ],
      });
    } else {
      if (
        (pipeline.isCheckUser || pipeline.isCheckDepartment) &&
        !isEligibleSeeAllCards
      ) {
        let includeCheckUserIds: string[] = [];

        if (pipeline.isCheckDepartment) {
          const userDepartmentIds = user?.departmentIds || [];
          const commonIds = userDepartmentIds.filter((id) =>
            pipelineDepartmentIds.includes(id),
          );

          const otherDepartmentUsers = await sendTRPCMessage({
            subdomain,

            pluginName: 'core',
            method: 'query',
            module: 'users',
            action: 'find',
            input: {
              query: { departmentIds: { $in: commonIds } },
            },
            defaultValue: [],
          });

          for (const departmentUser of otherDepartmentUsers) {
            includeCheckUserIds = [...includeCheckUserIds, departmentUser._id];
          }

          if (
            pipelineDepartmentIds.filter((departmentId) =>
              userDepartmentIds.includes(departmentId),
            ).length
          ) {
            includeCheckUserIds = includeCheckUserIds.concat(user._id || []);
          }
        }

        const uqinueCheckUserIds = [
          ...new Set(includeCheckUserIds.concat(userId)),
        ];

        Object.assign(filter, {
          $or: [
            { assignedUserIds: { $in: uqinueCheckUserIds } },
            { userId: { $in: uqinueCheckUserIds } },
          ],
        });
      }
    }
  }

  if (userIds) {
    const isEmpty = isListEmpty(userIds);

    filter.userId = isEmpty ? { $in: [null, []] } : { $in: userIds };
  }

  if (assignedToMe) {
    filter.assignedUserIds = { $in: [userId] };
  }

  if (segmentData) {
    const segment = JSON.parse(segmentData);
    const itemIds = await fetchSegment(subdomain, '', {}, segment);
    filter._id = { $in: itemIds };
  }

  if (segment) {
    const itemIds = await fetchSegment(subdomain, segment);

    filter._id = { $in: itemIds };
  }

  if (hasStartAndCloseDate) {
    filter.startDate = { $exists: true };
    filter.closeDate = { $exists: true };
  }

  if (number) {
    filter.number = { $regex: `${number}`, $options: 'mui' };
  }
  if (vendorCustomerIds?.length > 0) {
    const cards = await sendTRPCMessage({
      subdomain,

      pluginName: 'content',
      module: 'portal',
      action: 'clientPortalUserCards',
      input: {
        contentType: 'deal',
        cpUserId: { $in: vendorCustomerIds },
      },
      defaultValue: [],
    });
    const cardIds = cards.map((d) => d.contentTypeId);
    if (filter._id) {
      const ids = filter._id.$in;
      const newIds = ids.filter((d) => cardIds.includes(d));
      filter._id = { $in: newIds };
    } else {
      filter._id = { $in: cardIds };
    }
  }
  if ((stageId || stageCodes) && resolvedDayBetween) {
    const [dayFrom, dayTo] = resolvedDayBetween;
    filter.$expr = {
      $and: [
        // Convert difference between stageChangedDate and createdAt to days
        {
          $gte: [
            {
              $divide: [
                { $subtract: ['$stageChangedDate', '$createdAt'] },
                1000 * 60 * 60 * 24, // Convert milliseconds to days
              ],
            },
            dayFrom, // Minimum day (0 days)
          ],
        },
        {
          $lt: [
            {
              $divide: [
                { $subtract: ['$stageChangedDate', '$createdAt'] },
                1000 * 60 * 60 * 24,
              ],
            },
            dayTo, // Maximum day (3 days)
          ],
        },
      ],
    };
  }

  if (productIds) {
    filter['productsData.productId'] = { $in: productIds };
  }

  // Calendar monthly date
  if (date) {
    const stageIds = await models.Stages.find({ pipelineId }).distinct('_id');

    const { year, month } = date;

    filter.closeDate = {
      $gte: new Date(Date.UTC(year, month, 1, 0, 0, 0)),
      $lte: new Date(Date.UTC(year, month + 1, 1, 0, 0, 0)),
    };

    filter.stageId = { $in: stageIds };
  }

  if (createdStartDate || createdEndDate) {
    filter.createdAt = {
      $gte: new Date(createdStartDate),
      $lte: new Date(createdEndDate),
    };
  }

  if (stateChangedStartDate || stateChangedEndDate) {
    filter.stageChangedDate = {
      $gte: new Date(stateChangedStartDate),
      $lte: new Date(stateChangedEndDate),
    };
  }

  if (startDateStartDate || startDateEndDate) {
    filter.startDate = {
      $gte: new Date(startDateStartDate),
      $lte: new Date(startDateEndDate),
    };
  }

  if (closeDateStartDate || closeDateEndDate) {
    filter.closeDate = {
      $gte: new Date(closeDateStartDate),
      $lte: new Date(closeDateEndDate),
    };
  }

  return filter;
};

export const dealQueries = {
  /**
   * Deals list
   */
  async deals(
    _root,
    args: IDealQueryParams,
    { user, models, subdomain }: IContext,
  ) {
    const filter = await generateFilter(models, subdomain, user._id, args);

    const getExtraFields = async (item: any) => ({
      amount: await dealResolvers.amount(item),
      unUsedAmount: await dealResolvers.unusedAmount(item),
    });

    const {
      list: deals,
      pageInfo,
      totalCount,
    } = await getItemList(
      models,
      subdomain,
      filter,
      args,
      user,
      getExtraFields,
    );

    const dealProductIds = deals.flatMap((deal) => {
      if (deal.productsData && deal.productsData.length > 0) {
        return deal.productsData.flatMap((pData) => pData.productId || []);
      }

      return [];
    });

    const products =
      (dealProductIds.length &&
        (await sendTRPCMessage({
          subdomain,

          pluginName: 'core',
          method: 'query',
          module: 'products',
          action: 'find',
          input: {
            query: {
              _id: { $in: [...new Set(dealProductIds)] },
            },
          },
          defaultValue: [],
        }))) ||
      [];

    for (const deal of deals) {
      let pd = deal.productsData;

      if (!pd || pd.length === 0) {
        continue;
      }

      deal.products = [];

      // do not display to many products
      pd = pd.slice(0, 10);

      for (const pData of pd) {
        if (!pData.productId) {
          continue;
        }

        deal.products.push({
          ...(typeof pData.toJSON === 'function' ? pData.toJSON() : pData),
          product: products.find((p) => p._id === pData.productId) || {},
        });
      }

      // do not display to many products
      if (deal.productsData.length > pd.length) {
        deal.products.push({
          product: {
            name: '...More',
          },
        });
      }
    }

    return { list: deals, pageInfo, totalCount };
  },

  async dealsTotalCount(
    _root,
    args: IDealQueryParams,
    { user, models, subdomain }: IContext,
  ) {
    const filter = await generateFilter(models, subdomain, user._id, args);

    return models.Deals.find(filter).countDocuments();
  },

  /**
   * Archived list
   */
  async archivedDeals(_root, args: IArchiveArgs, { models }: IContext) {
    return archivedItems(models, args);
  },

  async archivedDealsCount(_root, args: IArchiveArgs, { models }: IContext) {
    return archivedItemsCount(models, args, models.Deals);
  },

  /**
   *  Deal total amounts
   */
  async dealsTotalAmounts(
    _root,
    args: IDealQueryParams,
    { user, models, subdomain }: IContext,
  ) {
    const filter = await generateFilter(models, subdomain, user._id, args);

    const amountList = await models.Deals.aggregate([
      {
        $match: filter,
      },
      {
        $lookup: {
          from: 'sales_stages',
          let: { letStageId: '$stageId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$letStageId'],
                },
              },
            },
            {
              $project: {
                probability: {
                  $cond: {
                    if: {
                      $or: [
                        { $eq: ['$probability', 'Won'] },
                        { $eq: ['$probability', 'Lost'] },
                      ],
                    },
                    then: '$probability',
                    else: 'In progress',
                  },
                },
                probabilityOld: '$probability',
              },
            },
          ],
          as: 'stageProbability',
        },
      },
      {
        $unwind: '$productsData',
      },
      {
        $unwind: '$stageProbability',
      },
      {
        $project: {
          amount: '$productsData.amount',
          currency: '$productsData.currency',
          type: '$stageProbability.probabilityOld',
          tickUsed: '$productsData.tickUsed',
        },
      },
      {
        $match: { tickUsed: true },
      },
      {
        $group: {
          _id: { currency: '$currency', type: '$type' },

          amount: {
            $sum: '$amount',
          },
        },
      },
      {
        $group: {
          _id: '$_id.type',
          currencies: {
            $push: { amount: '$amount', name: '$_id.currency' },
          },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    const forecastedTotal = {};
    const inprogressTotal = {};

    const percentage = (p) => {
      return Number.parseInt(p.replace('%', '')) / 100;
    };
    amountList
      .filter((type) => !['Won', 'Lost'].includes(type._id))
      .map((type) => {
        type.currencies.map((currency) => {
          if (forecastedTotal[currency.name]) {
            forecastedTotal[currency.name] =
              forecastedTotal[currency.name] +
              currency.amount * percentage(type._id);

            inprogressTotal[currency.name] += currency.amount;
          } else {
            forecastedTotal[currency.name] =
              currency.amount * percentage(type._id);
            inprogressTotal[currency.name] = currency.amount;
          }
        });
      });
    let currencies = [] as any;
    for (const [key, value] of Object.entries(inprogressTotal)) {
      currencies.push({ name: key, amount: value });
    }
    const inProgress = {
      _id: Math.random(),
      name: 'In progress',
      currencies: currencies,
    };
    currencies = [];
    for (const [key, value] of Object.entries(forecastedTotal)) {
      currencies.push({ name: key, amount: value });
    }
    const forecasted = {
      _id: Math.random(),
      name: 'forecasted 10-90%',
      currencies: currencies,
    };
    amountList.filter((type) => ['Won', 'Lost'].includes(type._id));

    const responseArray = amountList
      .filter((type) => ['Won', 'Lost'].includes(type._id))
      .map((type) => {
        return {
          _id: Math.random(),
          name: type._id,
          currencies: type.currencies,
        };
      });

    responseArray.push(forecasted);
    responseArray.push(inProgress);
    return responseArray;
  },

  /**
   * Deal detail
   */
  async dealDetail(
    _root,
    { _id, clientPortalCard }: { _id: string; clientPortalCard: boolean },
    { user, models, subdomain }: IContext,
  ) {
    const deal = await models.Deals.getDeal(_id);

    // no need to check permission on cp deal
    if (clientPortalCard) {
      return deal;
    }

    return checkItemPermByUser(models, subdomain, user, deal);
  },

  //   async checkDiscount() {}
};

// moduleRequireLogin(dealQueries);
// checkPermission(dealQueries, 'deals', 'showDeals');
