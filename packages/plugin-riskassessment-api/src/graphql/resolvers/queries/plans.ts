import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { generateSort } from '../../../utils';

const addDateRangeFilter = (filter: any, field: string, from: any, to: any) => {
  if (from) {
    filter[field] = { $gte: from };
  }
  if (to) {
    filter[field] = { ...filter[field], $lte: to };
  }
};

const generateFilters = params => {
  const filter: any = { status: { $ne: 'archived' } };

  if (params.isArchived) {
    filter.status = 'archived';
  }

  if (!!params?.plannerIds?.length) {
    filter.plannerId = { $in: params?.plannerIds || [] };
  }

  if (params?.structureIds?.length) {
    filter.structureTypeId = { $in: params?.structureIds };
  }

  if (params.searchValue) {
    filter.name = { $regex: new RegExp(params.searchValue, 'i') };
  }

  // Handle all date range filters
  addDateRangeFilter(
    filter,
    'createDate',
    params.createDateFrom,
    params.createDateTo
  );
  addDateRangeFilter(
    filter,
    'startDate',
    params.startDateFrom,
    params.startDateTo
  );
  addDateRangeFilter(
    filter,
    'closeDate',
    params.closeDateFrom,
    params.closeDateTo
  );
  addDateRangeFilter(
    filter,
    'createdAt',
    params.createdAtFrom,
    params.createdAtTo
  );
  addDateRangeFilter(
    filter,
    'modifiedAt',
    params.modifiedAtFrom,
    params.modifiedAtTo
  );

  if (params.tagIds) {
    filter.tagId = { $in: params.tagIds };
  }

  if (params.status) {
    filter.status = { $in: params.status };
  }

  return filter;
};

const RiskAssessmentPlansQueries = {
  async riskAssessmentPlans(_root, args, { models }: IContext) {
    const filter = generateFilters(args);
    const { sortField, sortDirection } = args;
    const sort = generateSort(sortField, sortDirection);

    return paginate(models.Plans.find(filter).sort(sort), args);
  },
  async riskAssessmentPlansTotalCount(_root, args, { models }: IContext) {
    const filter = generateFilters(args);

    return await models.Plans.find(filter).countDocuments();
  },
  async riskAssessmentPlan(_root, { _id }, { models }: IContext) {
    return await models.Plans.findOne({ _id });
  },

  async riskAssessmentSchedules(_root, { planId }, { models }: IContext) {
    return await models.Schedules.find({ planId });
  },
  async riskAssessmentSchedulesTotalCount(
    _root,
    { planId },
    { models }: IContext
  ) {
    return await models.Schedules.countDocuments({ planId });
  },
};

export default RiskAssessmentPlansQueries;
