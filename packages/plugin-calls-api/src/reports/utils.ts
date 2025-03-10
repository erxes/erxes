import * as dayjs from 'dayjs';
import * as isoWeek from 'dayjs/plugin/isoWeek';
import * as localizedFormat from "dayjs/plugin/localizedFormat"
import { CALL_STATUS_LABELS } from './constants';
import { IUser } from '@erxes/api-utils/src/types';
import { sendToGrandStream } from '../utils';

dayjs.extend(localizedFormat)
dayjs.extend(isoWeek);

export const buildDateRange = (
  dateRange: string,
  startDate: Date,
  endDate: Date,
) => {
  let startOfDate, endOfDate;

  switch (dateRange) {
    case 'today':
      startOfDate = dayjs().startOf('day');
      endOfDate = dayjs().endOf('day');
      break;
    case 'yesterday':
      startOfDate = dayjs().subtract(1, 'day').startOf('day');
      endOfDate = dayjs().subtract(1, 'day').endOf('day');
      break;
    case 'thisWeek':
      startOfDate = dayjs().startOf('week');
      endOfDate = dayjs().endOf('week');
      break;
    case 'lastWeek':
      startOfDate = dayjs().subtract(1, 'week').startOf('week');
      endOfDate = dayjs().subtract(1, 'week').endOf('week');
      break;
    case 'thisMonth':
      startOfDate = dayjs().startOf('month');
      endOfDate = dayjs().endOf('month');
      break;
    case 'lastMonth':
      startOfDate = dayjs().subtract(1, 'month').startOf('month');
      endOfDate = dayjs().subtract(1, 'month').endOf('month');
      break;
    case 'thisYear':
      startOfDate = dayjs().startOf('year');
      endOfDate = dayjs().endOf('year');
      break;
    case 'lastYear':
      startOfDate = dayjs().subtract(1, 'year').startOf('year');
      endOfDate = dayjs().subtract(1, 'year').endOf('year');
      break;
    case 'customDate':
      startOfDate = dayjs(startDate).startOf('day');
      endOfDate = dayjs(endDate).startOf('day');
      break;
    default:
      break;
  }

  if (startOfDate && endOfDate) {
    return {
      startOfDate: startOfDate?.toDate(),
      endOfDate: endOfDate?.toDate(),
    };
  }

  return {};
};

export const buildMatchFilter = async (filter: any) => {
  const { userIds, type, status, endedBy, dateRange } = filter;

  const matchfilter = {};

  if (userIds?.length) {
    matchfilter['createdBy'] = { $in: userIds };
  }

  if (type) {
    matchfilter['callType'] = { $eq: type };
  }

  if (status) {
    matchfilter['callStatus'] = { $eq: status };
  }

  if (endedBy) {
    matchfilter['endedBy'] = { $eq: endedBy };
  }

  if (dateRange) {
    const { startDate, endDate, dateRangeType = 'createdAt' } = filter;

    const { startOfDate, endOfDate } = buildDateRange(
      dateRange,
      startDate,
      endDate,
    );

    if (startOfDate && endOfDate) {
      matchfilter[dateRangeType] = { $gte: startOfDate, $lte: endOfDate };
    }
  }

  return matchfilter;
};

export const formatWeek = (frequency) => {
  let startOfDate, endOfDate;

  const [year, week] = frequency?.split('-') || '';

  startOfDate = dayjs()
    .year(year)
    .isoWeek(week)
    .startOf('isoWeek')
    .format('MM/DD');
  endOfDate = dayjs().year(year).isoWeek(week).endOf('isoWeek').format('MM/DD');

  if (startOfDate && endOfDate) {
    return `Week ${week} ${startOfDate}-${endOfDate}`;
  }

  return '';
};

export const formatMonth = (frequency) => {
  const MONTH_NAMES = {
    '01': 'January',
    '02': 'February',
    '03': 'March',
    '04': 'April',
    '05': 'May',
    '06': 'June',
    '07': 'July',
    '08': 'August',
    '09': 'September',
    '10': 'October',
    '11': 'November',
    '12': 'December',
  };

  return MONTH_NAMES[frequency];
};

export const formatFrequency = (frequencyType, frequency) => {
  let format = '';

  switch (frequencyType) {
    // Week of month (01-53)
    case '%Y-%V':
      format = formatWeek(frequency);
      break;
    // Month (01-12)
    case '%m':
      format = formatMonth(frequency);
      break;
    // Year - Month - Day - Hour - Minute - Second
    case '%Y-%m-%d %H:%M:%S':
      format = dayjs(new Date(frequency)).format('YYYY-MM-DD h:mm:ss A');
      break;
    // Year (0000-9999)
    case '%Y':
    // Year - Month - Day
    case '%Y-%m-%d':
      format = frequency;
      break;
    default:
      break;
  }

  return format;
};

export const buildAction = (measures: string[]): object => {
  const actions = {};

  (measures || []).forEach((measure) => {
    switch (measure) {
      case 'count':
        actions[measure] = { $sum: 1 };
        break;
      case 'totalDuration':
        actions[measure] = { $sum: '$callDuration' };
        break;
      case 'averageDuration':
        actions[measure] = { $avg: '$callDuration' };
        break;
      default:
        actions[measure] = { $sum: 1 };
        break;
    }
  });

  return actions;
};

export const buildPipeline = (filter: any, matchFilter: any) => {
  const {
    dimension: dimensions,
    measure: measures,
    frequencyType = '%m',
    sortBy
  } = filter;

  const pipeline: any = [];

  const matchStage = {};

  if (
    (dimensions || []).some((dimension) =>
      ['brand', 'channel', 'integration'].includes(dimension),
    )
  ) {
    matchStage['inboxIntegrationId'] = { $ne: null };
  }

  if ((dimensions || []).includes('createdAt')) {
    matchStage['createdAt'] = { $ne: null };
  }

  if ((dimensions || []).includes('number')) {
    matchStage['extentionNumber'] = { $exists: true, $ne: null };
  }

  if ((dimensions || []).includes('record')) {
    matchStage['recordUrl'] = { $exists: true };
  }

  if ((dimensions || []).includes('type')) {
    matchStage['callType'] = { $ne: null };
  }

  if ((dimensions || []).includes('status')) {
    matchStage['callStatus'] = { $ne: null };
  }

  if ((dimensions || []).includes('endedBy')) {
    matchStage['endedBy'] = { $ne: null };
  }

  if ((dimensions || []).includes('queueName')) {
    matchStage['queueName'] = { $ne: null };
  }

  if ((dimensions || []).includes('operator')) {
    matchStage['operatorPhone'] = { $ne: null };
  }

  if ((dimensions || []).includes('customer')) {
    matchStage['customerPhone'] = { $ne: null };
  }

  if ((dimensions || []).includes('frequency')) {
    matchStage['createdAt'] = { $ne: null };
  }

  pipeline.push({ $match: { ...matchStage, ...matchFilter } });

  if ((dimensions || []).includes('brand')) {
    pipeline.push(
      {
        $lookup: {
          from: 'integrations',
          localField: 'inboxIntegrationId',
          foreignField: '_id',
          as: 'integration',
        },
      },
      {
        $unwind: '$integration',
      },
    );
  }

  const groupStage: any = {
    $group: {
      _id: {},
      ...buildAction(measures),
    },
  };

  if ((dimensions || []).includes('teamMember')) {
    groupStage.$group._id['teamMember'] = '$createdBy';
  }

  if ((dimensions || []).includes('createdAt')) {
    groupStage.$group._id['createdAt'] = '$createdAt';
  }

  if ((dimensions || []).includes('type')) {
    groupStage.$group._id['type'] = '$callType';
  }

  if ((dimensions || []).includes('status')) {
    groupStage.$group._id['status'] = '$callStatus';
  }

  if ((dimensions || []).includes('endedBy')) {
    groupStage.$group._id['endedBy'] = '$endedBy';
  }

  if ((dimensions || []).includes('queue')) {
    groupStage.$group._id['queue'] = '$queueName';
  }

  if ((dimensions || []).includes('operator')) {
    groupStage.$group._id['operator'] = '$operatorPhone';
  }

  if ((dimensions || []).includes('customer')) {
    groupStage.$group._id['customer'] = '$customerPhone';
  }

  if ((dimensions || []).includes('brand')) {
    groupStage.$group._id['brand'] = '$integration.brandId';
  }

  if ((dimensions || []).includes('channel')) {
    groupStage.$group._id['channel'] = '$inboxIntegrationId';
  }

  if ((dimensions || []).includes('integration')) {
    groupStage.$group._id['integration'] = '$inboxIntegrationId';
  }

  if ((dimensions || []).includes('number')) {
    groupStage.$group._id['number'] = '$extentionNumber';
  }

  if ((dimensions || []).includes('record')) {
    groupStage.$group._id['record'] = '$recordUrl';
  }

  if ((dimensions || []).includes('frequency')) {
    groupStage.$group._id['frequency'] = {
      $dateToString: {
        format: `${frequencyType}`,
        date: '$createdAt',
      },
    };
  }

  if (((dimensions || []).includes('frequency') && frequencyType === '%Y-%m-%d %H:%M:%S') || (dimensions || []).includes('record')) {
    groupStage.$group.doc = { $first: "$$ROOT" };
  }

  pipeline.push(groupStage);

  if ((dimensions || []).includes('teamMember')) {
    pipeline.push(
      {
        $lookup: {
          from: 'users',
          let: { fieldId: '$_id.teamMember' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$fieldId'] },
                    { $eq: ['$isActive', true] },
                  ],
                },
              },
            },
          ],
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
    );
  }

  if ((dimensions || []).includes('brand')) {
    pipeline.push(
      {
        $lookup: {
          from: 'brands',
          localField: '_id.brand',
          foreignField: '_id',
          as: 'brand',
        },
      },
      {
        $unwind: '$brand',
      },
    );
  }

  if ((dimensions || []).includes('channel')) {
    pipeline.push(
      {
        $lookup: {
          from: 'channels',
          localField: '_id.channel',
          foreignField: 'integrationIds',
          as: 'channel',
        },
      },
      {
        $unwind: '$channel',
      },
    );
  }

  if ((dimensions || []).includes('integration')) {
    pipeline.push(
      {
        $lookup: {
          from: 'integrations',
          localField: '_id.integration',
          foreignField: '_id',
          as: 'integration',
        },
      },
      {
        $unwind: '$integration',
      },
    );
  }

  const projectStage = {
    $project: {
      _id: 0,
    },
  };

  measures?.forEach((measure) => {
    projectStage.$project[measure] = 1;
  });

  if ((dimensions || []).includes('teamMember')) {
    projectStage.$project['teamMember'] = '$user';
  }

  if ((dimensions || []).includes('createdAt')) {
    projectStage.$project['createdAt'] = '$_id.createdAt';
  }

  if ((dimensions || []).includes('type')) {
    projectStage.$project['type'] = '$_id.type';
  }

  if ((dimensions || []).includes('status')) {
    projectStage.$project['status'] = '$_id.status';
  }

  if ((dimensions || []).includes('endedBy')) {
    projectStage.$project['endedBy'] = '$_id.endedBy';
  }

  if ((dimensions || []).includes('queue')) {
    projectStage.$project['queue'] = '$_id.queue';
  }

  if ((dimensions || []).includes('operator')) {
    projectStage.$project['operator'] = '$_id.operator';
  }

  if ((dimensions || []).includes('customer')) {
    projectStage.$project['customer'] = '$_id.customer';
  }

  if ((dimensions || []).includes('brand')) {
    projectStage.$project['brand'] = '$brand.name';
  }

  if ((dimensions || []).includes('channel')) {
    projectStage.$project['channel'] = '$channel.name';
  }

  if ((dimensions || []).includes('integration')) {
    projectStage.$project['integration'] = '$integration.name';
  }

  if ((dimensions || []).includes('frequency')) {
    projectStage.$project['frequency'] = '$_id.frequency';
  }

  if ((dimensions || []).includes('number')) {
    projectStage.$project['number'] = '$_id.number';
  }

  if ((dimensions || []).includes('record')) {
    projectStage.$project['record'] = '$_id.record';
  }

  if (((dimensions || []).includes('frequency') && frequencyType === '%Y-%m-%d %H:%M:%S') || (dimensions || []).includes('record')) {
    projectStage.$project['conversationId'] = '$doc.conversationId';
  }

  pipeline.push(projectStage);

  if (sortBy?.length) {
    const sortFields = (sortBy || []).reduce((acc, { field, direction }) => {
      acc[field] = direction;
      return acc;
    }, {});

    pipeline.push({ $sort: sortFields });
  }

  return pipeline;
};

export const formatData = (data, frequencyType) => {
  const formattedData = [...data];

  formattedData.forEach((item) => {
    if (item.hasOwnProperty('teamMember')) {
      const user: IUser = item['teamMember'];

      item['teamMember'] =
        user.details?.fullName ||
        `${user.details?.firstName} ${user.details?.lastName}` ||
        user.email;
    }

    if (item.hasOwnProperty('frequency')) {
      const frequency = item['frequency'];

      item['frequency'] = formatFrequency(frequencyType, frequency);
    }

    if (item.hasOwnProperty('createdAt')) {
      const createdAt = item['createdAt'];
        
      item['createdAt'] = dayjs(createdAt).format('YYYY/MM/DD LT');
    }

    ['totalDuration', 'averageDuration'].forEach(key => {
      if (item.hasOwnProperty(key) && [key]) {
        item[key] = item[key] * 1000;
      }
    });

    ['type', 'status', 'endedBy'].forEach((key) => {
      if (item.hasOwnProperty(key)) {
        const label = item[key];
        item[key] = CALL_STATUS_LABELS[label];
      }
    });

    if ((item.hasOwnProperty('frequency') && item.hasOwnProperty('conversationId')) || item.hasOwnProperty('record')) {
      item.url = `/inbox/index?_id=${item.conversationId}`;
      delete item['conversationId']
    }
  });

  return formattedData;
};

export const buildData = ({
  chartType,
  data,
  measure,
  dimension,
  frequencyType,
}) => {
  const formattedData = formatData(data, frequencyType);

  switch (chartType) {
    case 'bar':
    case 'line':
    case 'pie':
    case 'doughnut':
    case 'radar':
    case 'polarArea':
      return buildChartData(formattedData, measure, dimension);
    case 'table':
      return buildTableData(formattedData, measure, dimension);
    default:
      return data;
  }
};

export const buildChartData = (data: any, measures: any, dimensions: any) => {
  const datasets = (data || []).map((item) => item[measures[0]]);
  const labels = (data || []).map((item) => item[dimensions[0]]);

  return { data: datasets, labels };
};

export const buildTableData = (data: any, measures: any, dimensions: any) => {
  const reorderedData = data.map((item) => {
    const order: any = {};

    if (dimensions?.length) {
      dimensions.forEach((dimension) => {
        order[dimension] = item[dimension];
      });
    }

    if (measures?.length) {
      measures.forEach((measure) => {
        order[measure] = item[measure];
      });
    }

    if (item.hasOwnProperty("url")) {
      order.url = item.url || ''
    }

    return order;
  });

  let total = '-';

  if (measures?.length) {
    total = data.reduce((acc, item) => {

      acc['total'] = dimensions.length;

      (measures || []).forEach((measure) => {
        if (item[measure] !== undefined) {
          acc[measure] = (acc[measure] || 0) + item[measure];
        }
      });

      return acc;
    }, {});
  }

  return { data: [...reorderedData, total], headers: [...dimensions, ...measures] };
};

export const getGrandStreamData = async (models, user) => {
  const { response } = await sendToGrandStream(
    models,
    {
      path: 'api',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: {
        request: {
          action: 'listQueue',
          options: 'extension,queue_name,members',
          sidx: 'extension',
          sord: 'asc',
        },
      },

      isConvertToJson: true,
      isGetExtension: true,
    },
    user,
  );

  return response;
};
