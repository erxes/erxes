import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { generateSort } from '../../../utils';

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

  if (params.createDateFrom) {
    filter.createDate = { $gte: params.createdAtFrom };
  }

  if (params.createDateTo) {
    filter.createDate = { ...filter?.createDate, $gte: params.createDateTo };
  }

  if (params.startDateFrom) {
    filter.startDate = { $gte: params.startDateFrom };
  }

  if (params.startDateTo) {
    filter.startDate = { ...filter?.startDate, $gte: params.startDateTo };
  }

  if (params.closeDateFrom) {
    filter.closeDate = { $gte: params.closeDateFrom };
  }

  if (params.closeDateTo) {
    filter.closeDate = {
      ...filter?.closeDate,
      $gte: params.closeDateTo
    };
  }

  if (params.createdAtFrom) {
    filter.createdAt = { $gte: params.createdAtFrom };
  }

  if (params.createdAtTo) {
    filter.createdAt = {
      ...filter?.createdAt,
      $gte: params.createdAtTo
    };
  }

  if (params.modifiedAtFrom) {
    filter.modifiedAt = { $gte: params.modifiedAtFrom };
  }

  if (params.modifiedAtTo) {
    filter.modifiedAt = {
      ...filter?.modifiedAt,
      $gte: params.modifiedAtTo
    };
  }

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

    return await models.Plans.find(filter).count();
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
  }
};

export default RiskAssessmentPlansQueries;
