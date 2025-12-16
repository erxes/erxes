import { getSubdomain, sendTRPCMessage } from 'erxes-api-shared/utils';
import _ from 'lodash';
import { IModels, generateModels } from '~/connectionResolvers';
import { IGoalDocument } from '~/modules/goals/@types/goals';

export const getGoalsData = async (
  subdomain: string,
  models: IModels,
  filter: any = {},
  params: { page?: number; perPage?: number } = {}
) => {
  try {
    const page = params.page || 1;
    const perPage = params.perPage || 20;
    const skip = (page - 1) * perPage;

    const query: any = { ...filter, subdomain };

    const goals = await models.Goals.find(query)
      .skip(skip)
      .limit(perPage)
      .sort({ createdAt: -1 })
      .lean();

    const goalsWithProgress = await Promise.all(
      goals.map(async (goal) => {
        try {
          const progressData = await models.Goals.progressIdsGoals(
            { _id: goal._id },
            { page: 1, perPage: 1 }
          );

          return {
            ...goal,
            progress: progressData[0] || null
          };
        } catch (error) {
          console.error('Error calculating progress for goal', {
            goalId: goal._id,
            error
          });
          return { ...goal, progress: null };
        }
      })
    );

    const totalCount = await models.Goals.countDocuments(query);

    return {
      status: 'success',
      data: {
        list: goalsWithProgress,
        totalCount,
        page,
        perPage,
        totalPages: Math.ceil(totalCount / perPage)
      }
    };
  } catch (error) {
    console.error('Error fetching goals data:', error);
    throw error;
  }
};

export const getGoalDetailData = async (
  subdomain: string,
  models: IModels,
  goalId: string
) => {
  try {
    const goal = await models.Goals.findOne({
      _id: goalId,
      subdomain
    }).lean();

    if (!goal) {
      throw new Error('Goal not found');
    }

    const progressData = await models.Goals.progressIdsGoals(
      { _id: goalId },
      { page: 1, perPage: 1 }
    );

    return {
      status: 'success',
      data: {
        ...goal,
        progress: progressData[0] || null
      }
    };
  } catch (error) {
    console.error('Error fetching goal detail', {
      goalId,
      error
    });
    throw error;
  }
};

export const createGoalData = async (
  subdomain: string,
  models: IModels,
  goalData: any
) => {
  try {
    const requiredFields = [
      'name',
      'entity',
      'contributionType',
      'metric',
      'startDate',
      'endDate'
    ];
    const missingFields = requiredFields.filter(
      (field) => !goalData[field]
    );

    if (missingFields.length > 0) {
      throw new Error(
        `Missing required fields: ${missingFields.join(', ')}`
      );
    }

    const goalToCreate = {
      ...goalData,
      subdomain,
      createdAt: new Date()
    };

    const goal = await models.Goals.create(goalToCreate);

    return {
      status: 'success',
      data: goal
    };
  } catch (error) {
    console.error('Error creating goal:', error);
    throw error;
  }
};

export const updateGoalData = async (
  subdomain: string,
  models: IModels,
  goalId: string,
  updateData: any
) => {
  try {
    const goal = await models.Goals.findOne({
      _id: goalId,
      subdomain
    });

    if (!goal) {
      throw new Error('Goal not found');
    }

    Object.assign(goal, updateData);
    await goal.save();

    await models.Goals.progressIdsGoals(
      { _id: goalId },
      { page: 1, perPage: 1 }
    );

    const updatedGoal = await models.Goals.findOne({
      _id: goalId,
      subdomain
    }).lean();

    return {
      status: 'success',
      data: updatedGoal
    };
  } catch (error) {
    console.error('Error updating goal', {
      goalId,
      error
    });
    throw error;
  }
};

export const deleteGoalData = async (
  subdomain: string,
  models: IModels,
  goalIds: string[]
) => {
  try {
    const result = await models.Goals.deleteMany({
      _id: { $in: goalIds },
      subdomain
    });

    return {
      status: 'success',
      data: {
        deletedCount: result.deletedCount,
        goalIds
      }
    };
  } catch (error) {
    console.error('Error deleting goals:', error);
    throw error;
  }
};

export const getGoalProgressData = async (
  subdomain: string,
  models: IModels,
  filter: any = {},
  params: { page?: number; perPage?: number } = {}
) => {
  try {
    const page = params.page || 1;
    const perPage = params.perPage || 20;

    const queryFilter = { ...filter, subdomain };

    const progressData = await models.Goals.progressIdsGoals(queryFilter, {
      page,
      perPage
    });

    const totalCount = await models.Goals.countDocuments(queryFilter);

    return {
      status: 'success',
      data: {
        list: progressData,
        totalCount,
        page,
        perPage,
        totalPages: Math.ceil(totalCount / perPage)
      }
    };
  } catch (error) {
    console.error('Error fetching goal progress data:', error);
    throw error;
  }
};

export const goalsInit = async (req, res) => {
  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const {
      page = 1,
      perPage = 20,
      branch,
      department,
      unit,
      contribution,
      entity,
      metric,
      periodGoal,
      teamGoalType,
      contributionType,
      date,
      endDate,
      searchValue
    } = req.query;

    const filter: any = {};

    addArrayFilter(filter, 'branch', branch);
    addArrayFilter(filter, 'department', department);
    addArrayFilter(filter, 'unit', unit);
    addArrayFilter(filter, 'contribution', contribution);

    if (entity) filter.entity = entity;
    if (metric) filter.metric = metric;
    if (periodGoal) filter.periodGoal = periodGoal;
    if (teamGoalType) filter.teamGoalType = teamGoalType;
    if (contributionType) filter.contributionType = contributionType;

    addDateFilter(filter, date as string, endDate as string);
    addSearchFilter(filter, searchValue as string);

    const result = await getGoalsData(subdomain, models, filter, {
      page: Number(page),
      perPage: Number(perPage)
    });

    res.send(result);
  } catch (error) {
    console.error('Error in goalsInit:', error);
    res.status(500).send({
      status: 'error',
      message: error.message
    });
  }
};

const addArrayFilter = (filter: any, key: string, value: any) => {
  if (!value) return;

  const values = Array.isArray(value) ? value : [value];
  filter[key] = { $in: values };
};

const addDateFilter = (filter: any, date?: string, endDate?: string) => {
  if (!date && !endDate) return;

  filter.$and = [];

  if (date) {
    filter.$and.push({ endDate: { $gte: new Date(date) } });
  }

  if (endDate) {
    filter.$and.push({ startDate: { $lte: new Date(endDate) } });
  }
};

const addSearchFilter = (filter: any, searchValue?: string) => {
  if (!searchValue) return;

  const safe = _.escapeRegExp(searchValue);
  filter.name = { $regex: new RegExp(safe, 'i') };
};

export const goalDetail = async (req, res) => {
  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);
    const { _id } = req.params;

    if (!_id) {
      return res.status(400).send({
        status: 'error',
        message: 'Goal ID is required'
      });
    }

    const result = await getGoalDetailData(subdomain, models, _id);
    res.send(result);
  } catch (error) {
    console.error('Error in goalDetail:', error);
    res.status(500).send({
      status: 'error',
      message: error.message
    });
  }
};

export const goalsCreate = async (req, res) => {
  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);
    const goalData = req.body;

    const result = await createGoalData(subdomain, models, goalData);
    res.send(result);
  } catch (error) {
    console.error('Error in goalsCreate:', error);
    res.status(500).send({
      status: 'error',
      message: error.message
    });
  }
};

export const goalsUpdate = async (req, res) => {
  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);
    const { _id } = req.params;
    const updateData = req.body;

    if (!_id) {
      return res.status(400).send({
        status: 'error',
        message: 'Goal ID is required'
      });
    }

    const result = await updateGoalData(subdomain, models, _id, updateData);
    res.send(result);
  } catch (error) {
    console.error('Error in goalsUpdate:', error);
    res.status(500).send({
      status: 'error',
      message: error.message
    });
  }
};

export const goalsDelete = async (req, res) => {
  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);
    const { goalIds } = req.body;

    if (!goalIds || !Array.isArray(goalIds) || goalIds.length === 0) {
      return res.status(400).send({
        status: 'error',
        message: 'Goal IDs array is required'
      });
    }

    const result = await deleteGoalData(subdomain, models, goalIds);
    res.send(result);
  } catch (error) {
    console.error('Error in goalsDelete:', error);
    res.status(500).send({
      status: 'error',
      message: error.message
    });
  }
};

export const goalsProgress = async (req, res) => {
  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const { page = 1, perPage = 20 } = req.query;

    const filter: any = {};

    if (req.query.goalId) filter._id = req.query.goalId;
    if (req.query.entity) filter.entity = req.query.entity;
    if (req.query.metric) filter.metric = req.query.metric;
    if (req.query.contributionType) {
      filter.contributionType = req.query.contributionType;
    }

    const result = await getGoalProgressData(subdomain, models, filter, {
      page: Number(page),
      perPage: Number(perPage)
    });

    res.send(result);
  } catch (error) {
    console.error('Error in goalsProgress:', error);
    res.status(500).send({
      status: 'error',
      message: error.message
    });
  }
};

export const goalsSyncProgress = async (req, res) => {
  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);
    const { goalId } = req.params;

    if (!goalId) {
      return res.status(400).send({
        status: 'error',
        message: 'Goal ID is required'
      });
    }

    await models.Goals.progressIdsGoals(
      { _id: goalId },
      { page: 1, perPage: 1 }
    );

    const updatedGoal = await models.Goals.findOne({
      _id: goalId,
      subdomain
    }).lean();

    res.send({
      status: 'success',
      data: updatedGoal
    });
  } catch (error) {
    console.error('Error in goalsSyncProgress:', error);
    res.status(500).send({
      status: 'error',
      message: error.message
    });
  }
};
