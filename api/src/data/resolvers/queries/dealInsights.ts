import { Deals } from '../../../db/models';
import { INSIGHT_TYPES } from '../../constants';
import { getDateFieldAsStr } from '../../modules/insights/aggregationUtils';
import { IDealListArgs } from '../../modules/insights/types';
import {
  fixChartData,
  fixDates,
  generateChartDataBySelector,
  generatePunchData,
  getDealSelector,
  getSummaryData,
  getTimezone,
} from '../../modules/insights/utils';
import { moduleRequireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';

const dealInsightQueries = {
  /**
   * Counts deals by each hours in each days.
   */
  async dealInsightsPunchCard(_root, args: IDealListArgs, { user }: IContext) {
    const selector = await getDealSelector(args);

    return generatePunchData(Deals, selector, user);
  },

  /**
   * Sends combined charting data for trends and summaries.
   */
  async dealInsightsMain(_root, args: IDealListArgs) {
    const { startDate, endDate, status } = args;
    const { start, end } = fixDates(startDate, endDate);

    const selector = await getDealSelector(args);

    const dateFieldName = status ? 'modifiedAt' : 'createdAt';

    const insightData: any = {};

    insightData.trend = await generateChartDataBySelector({
      selector,
      type: INSIGHT_TYPES.DEAL,
      dateFieldName: `$${dateFieldName}`,
    });

    insightData.summary = await getSummaryData({
      start,
      end,
      collection: Deals,
      selector: { ...selector },
      dateFieldName,
    });

    return insightData;
  },

  /**
   * Calculates won or lost deals for each team members.
   */
  async dealInsightsByTeamMember(_root, args: IDealListArgs, { user }: IContext) {
    const dealMatch = await getDealSelector(args);

    const insightAggregateData = await Deals.aggregate([
      {
        $match: dealMatch,
      },
      {
        $project: {
          date: await getDateFieldAsStr({ fieldName: '$modifiedAt', timeZone: getTimezone(user) }),
          modifiedBy: 1,
        },
      },
      {
        $group: {
          _id: {
            modifiedBy: '$modifiedBy',
            date: '$date',
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          modifiedBy: '$_id.modifiedBy',
          date: '$_id.date',
          count: 1,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'modifiedBy',
          foreignField: '_id',
          as: 'userDoc',
        },
      },
      {
        $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ['$userDoc.details', 0] }, '$$ROOT'] } },
      },
      {
        $group: {
          _id: '$modifiedBy',
          count: { $sum: '$count' },
          fullName: { $first: '$fullName' },
          avatar: { $first: '$avatar' },
          chartDatas: {
            $push: {
              date: '$date',
              count: '$count',
            },
          },
        },
      },
    ]);

    if (insightAggregateData.length < 1) {
      return [];
    }

    // Variables holds every user's response time.
    const teamMembers: any = [];
    const responseUserData: any = {};

    const aggregatedTrend = {};

    for (const userData of insightAggregateData) {
      // responseUserData
      responseUserData[userData._id] = {
        count: userData.count,
        fullName: userData.fullName,
        avatar: userData.avatar,
      };

      // team members gather
      const fixedChartData = await fixChartData(userData.chartDatas, 'date', 'count');

      userData.chartDatas.forEach(row => {
        if (row.date in aggregatedTrend) {
          aggregatedTrend[row.date] += row.count;
        } else {
          aggregatedTrend[row.date] = row.count;
        }
      });

      teamMembers.push({
        data: {
          fullName: userData.fullName,
          avatar: userData.avatar,
          graph: fixedChartData,
        },
      });
    }

    return teamMembers;
  },
};

moduleRequireLogin(dealInsightQueries);

export default dealInsightQueries;
