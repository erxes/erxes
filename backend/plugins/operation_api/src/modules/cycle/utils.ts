import { fillMissingDays } from '@/project/utils/charUtils';
import { STATUS_TYPES } from '@/status/constants/types';
import { differenceInCalendarDays, startOfDay } from 'date-fns';
import { Types } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export const getCyclesProgress = async (
  cycleId: string,
  assigneeId: string | undefined,
  models: IModels,
) => {
  const filter: { cycleId: Types.ObjectId; assigneeId?: string } = {
    cycleId: new Types.ObjectId(cycleId),
  };

  if (assigneeId) {
    filter.assigneeId = assigneeId;
  }

  const result = await models.Task.aggregate([
    {
      $match: {
        ...filter,
      },
    },
    {
      $facet: {
        totalScope: [
          { $match: { statusType: { $ne: STATUS_TYPES.CANCELLED } } },
          {
            $group: {
              _id: null,
              totalScope: {
                $sum: {
                  $cond: [
                    {
                      $or: [
                        { $eq: ['$estimatePoint', null] },
                        { $eq: ['$estimatePoint', 0] },
                      ],
                    },
                    1,
                    '$estimatePoint',
                  ],
                },
              },
            },
          },
        ],
        started: [
          { $match: { statusType: STATUS_TYPES.STARTED } },
          {
            $group: {
              _id: null,
              totalScope: {
                $sum: {
                  $cond: [
                    {
                      $or: [
                        { $eq: ['$estimatePoint', null] },
                        { $eq: ['$estimatePoint', 0] },
                      ],
                    },
                    1,
                    '$estimatePoint',
                  ],
                },
              },
            },
          },
        ],
        completed: [
          { $match: { statusType: STATUS_TYPES.COMPLETED } },
          {
            $group: {
              _id: null,
              totalScope: {
                $sum: {
                  $cond: [
                    {
                      $or: [
                        { $eq: ['$estimatePoint', null] },
                        { $eq: ['$estimatePoint', 0] },
                      ],
                    },
                    1,
                    '$estimatePoint',
                  ],
                },
              },
            },
          },
        ],
      },
    },
    {
      $project: {
        totalScope: {
          $ifNull: [{ $arrayElemAt: ['$totalScope.totalScope', 0] }, 0],
        },
        totalStartedScope: {
          $ifNull: [{ $arrayElemAt: ['$started.totalScope', 0] }, 0],
        },
        totalCompletedScope: {
          $ifNull: [{ $arrayElemAt: ['$completed.totalScope', 0] }, 0],
        },
      },
    },
  ]);

  return result?.[0] || {};
};

export const getCycleProgressChart = async (
  cycleId: string,
  assigneeId: string | undefined,
  models: IModels,
) => {
  const filter: { cycleId: Types.ObjectId; assigneeId?: string } = {
    cycleId: new Types.ObjectId(cycleId),
  };

  if (assigneeId) {
    filter.assigneeId = assigneeId;
  }

  const cycle = await models.Cycle.getCycle(cycleId);

  if (!cycle) {
    return [];
  }

  const [totalScopeResult] = await models.Task.aggregate([
    {
      $match: { ...filter },
    },
    {
      $match: { statusType: { $ne: STATUS_TYPES.CANCELLED } },
    },
    {
      $group: {
        _id: null,
        totalScope: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $eq: ['$estimatePoint', null] },
                  { $eq: ['$estimatePoint', 0] },
                ],
              },
              1,
              '$estimatePoint',
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalScope: { $ifNull: ['$totalScope', 0] },
      },
    },
  ]);

  const totalScope = totalScopeResult?.totalScope || 0;

  const dailyAggregation = await models.Task.aggregate([
    {
      $match: {
        ...filter,
        statusType: { $in: [STATUS_TYPES.STARTED, STATUS_TYPES.COMPLETED] },
        statusChangedDate: { $ne: null },
      },
    },
    {
      $addFields: {
        dayDate: {
          $dateFromParts: {
            year: { $year: '$statusChangedDate' },
            month: { $month: '$statusChangedDate' },
            day: { $dayOfMonth: '$statusChangedDate' },
          },
        },
        isStarted: { $eq: ['$statusType', STATUS_TYPES.STARTED] },
        isCompleted: { $eq: ['$statusType', STATUS_TYPES.COMPLETED] },
        estimateValue: {
          $cond: [
            {
              $or: [
                { $eq: ['$estimatePoint', null] },
                { $eq: ['$estimatePoint', 0] },
              ],
            },
            1,
            '$estimatePoint',
          ],
        },
      },
    },
    {
      $group: {
        _id: '$dayDate',
        started: { $sum: { $cond: ['$isStarted', '$estimateValue', 0] } },
        completed: { $sum: { $cond: ['$isCompleted', '$estimateValue', 0] } },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: { $dateToString: { format: '%Y-%m-%d', date: '$_id' } },
        started: 1,
        completed: 1,
      },
    },
  ]);

  let cumulativeStarted = 0;
  let cumulativeCompleted = 0;

  const chartDataAggregation = (dailyAggregation || []).map((entry) => {
    cumulativeStarted += entry.started;
    cumulativeCompleted += entry.completed;
    return {
      date: entry.date,
      started: cumulativeStarted,
      completed: cumulativeCompleted,
    };
  });

  const chartData: {
    totalScope: number;
    chartData: { date: string; started: number; completed: number }[];
  } = {
    totalScope,
    chartData: [],
  };

  const start = startOfDay(new Date(cycle.startDate));
  const end = startOfDay(new Date(cycle.endDate));

  const days = differenceInCalendarDays(end, start) + 1;

  chartData.chartData = fillMissingDays(
    chartDataAggregation,
    cycle.startDate,
    days,
  );

  return chartData;
};
export const getCycleProgressByProject = async (
  cycleId: string,
  assigneeId: string | undefined,
  models: IModels,
) => {
  const filter: { cycleId: Types.ObjectId; assigneeId?: string } = {
    cycleId: new Types.ObjectId(cycleId),
  };

  if (assigneeId) {
    filter.assigneeId = assigneeId;
  }

  return models.Task.aggregate([
    {
      $match: {
        ...filter,
      },
    },
    {
      $facet: {
        totalScope: [
          { $match: { statusType: { $ne: STATUS_TYPES.CANCELLED } } },
          {
            $group: {
              _id: '$projectId',
              totalScope: {
                $sum: {
                  $cond: [
                    {
                      $or: [
                        { $eq: ['$estimatePoint', null] },
                        { $eq: ['$estimatePoint', 0] },
                      ],
                    },
                    1,
                    '$estimatePoint',
                  ],
                },
              },
            },
          },
        ],
        started: [
          { $match: { statusType: STATUS_TYPES.STARTED } },
          {
            $group: {
              _id: '$projectId',
              totalScope: {
                $sum: {
                  $cond: [
                    {
                      $or: [
                        { $eq: ['$estimatePoint', null] },
                        { $eq: ['$estimatePoint', 0] },
                      ],
                    },
                    1,
                    '$estimatePoint',
                  ],
                },
              },
            },
          },
        ],
        completed: [
          { $match: { statusType: STATUS_TYPES.COMPLETED } },
          {
            $group: {
              _id: '$projectId',
              totalScope: {
                $sum: {
                  $cond: [
                    {
                      $or: [
                        { $eq: ['$estimatePoint', null] },
                        { $eq: ['$estimatePoint', 0] },
                      ],
                    },
                    1,
                    '$estimatePoint',
                  ],
                },
              },
            },
          },
        ],
      },
    },
    {
      $project: {
        merged: {
          $map: {
            input: '$totalScope',
            as: 'ts',
            in: {
              projectId: '$$ts._id',
              totalScope: '$$ts.totalScope',
              totalStartedScope: {
                $let: {
                  vars: {
                    match: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$started',
                            as: 'st',
                            cond: { $eq: ['$$st._id', '$$ts._id'] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: { $ifNull: ['$$match.totalScope', 0] },
                },
              },
              totalCompletedScope: {
                $let: {
                  vars: {
                    match: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$completed',
                            as: 'cm',
                            cond: { $eq: ['$$cm._id', '$$ts._id'] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: { $ifNull: ['$$match.totalScope', 0] },
                },
              },
            },
          },
        },
      },
    },
    { $unwind: '$merged' },
    { $replaceRoot: { newRoot: '$merged' } },
    { $sort: { totalScope: -1 } },
  ]);
};

export const getCycleProgressByMember = async (
  cycleId: string,
  assigneeId: string | undefined,
  models: IModels,
) => {
  const filter: { cycleId: Types.ObjectId; assigneeId?: string } = {
    cycleId: new Types.ObjectId(cycleId),
  };

  if (assigneeId) {
    filter.assigneeId = assigneeId;
  }

  return models.Task.aggregate([
    {
      $match: {
        ...filter,
      },
    },
    {
      $facet: {
        totalScope: [
          { $match: { statusType: { $ne: STATUS_TYPES.CANCELLED } } },
          {
            $group: {
              _id: '$assigneeId',
              totalScope: {
                $sum: {
                  $cond: [
                    {
                      $or: [
                        { $eq: ['$estimatePoint', null] },
                        { $eq: ['$estimatePoint', 0] },
                      ],
                    },
                    1,
                    '$estimatePoint',
                  ],
                },
              },
            },
          },
        ],
        started: [
          { $match: { statusType: STATUS_TYPES.STARTED } },
          {
            $group: {
              _id: '$assigneeId',
              totalScope: {
                $sum: {
                  $cond: [
                    {
                      $or: [
                        { $eq: ['$estimatePoint', null] },
                        { $eq: ['$estimatePoint', 0] },
                      ],
                    },
                    1,
                    '$estimatePoint',
                  ],
                },
              },
            },
          },
        ],
        completed: [
          { $match: { statusType: STATUS_TYPES.COMPLETED } },
          {
            $group: {
              _id: '$assigneeId',
              totalScope: {
                $sum: {
                  $cond: [
                    {
                      $or: [
                        { $eq: ['$estimatePoint', null] },
                        { $eq: ['$estimatePoint', 0] },
                      ],
                    },
                    1,
                    '$estimatePoint',
                  ],
                },
              },
            },
          },
        ],
      },
    },
    {
      $project: {
        merged: {
          $map: {
            input: '$totalScope',
            as: 'ts',
            in: {
              assigneeId: '$$ts._id',
              totalScope: '$$ts.totalScope',
              totalStartedScope: {
                $let: {
                  vars: {
                    match: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$started',
                            as: 'st',
                            cond: { $eq: ['$$st._id', '$$ts._id'] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: { $ifNull: ['$$match.totalScope', 0] },
                },
              },
              totalCompletedScope: {
                $let: {
                  vars: {
                    match: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$completed',
                            as: 'cm',
                            cond: { $eq: ['$$cm._id', '$$ts._id'] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: { $ifNull: ['$$match.totalScope', 0] },
                },
              },
            },
          },
        },
      },
    },
    { $unwind: '$merged' },
    { $replaceRoot: { newRoot: '$merged' } },
    { $sort: { totalScope: -1 } },
  ]);
};
