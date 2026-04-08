import * as dayjs from 'dayjs';
import * as isoWeek from 'dayjs/plugin/isoWeek';
import * as localizedFormat from 'dayjs/plugin/localizedFormat';
import * as utc from 'dayjs/plugin/utc';
import { CALLPRO_STATE_LABELS } from './constants';

dayjs.extend(localizedFormat);
dayjs.extend(isoWeek);
dayjs.extend(utc);

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
      endOfDate = dayjs(endDate).endOf('day');
      break;
    default:
      break;
  }

  if (startOfDate && endOfDate) {
    return {
      startOfDate: startOfDate.toDate(),
      endOfDate: endOfDate.toDate(),
    };
  }

  return {};
};

// Date filtering uses $toDate: '$_id' since CallProConversations has no createdAt field.
export const buildMatchFilter = (filter: any): Record<string, any> => {
  const { state, type, status, endedBy, dateRange, startDate, endDate } = filter;

  const matchFilter: Record<string, any> = {};

  if (state) {
    matchFilter['state'] = { $eq: state };
  }

  if (type) {
    matchFilter['callType'] = { $eq: type };
  }

  if (status) {
    matchFilter['callStatus'] = { $eq: status };
  }

  if (endedBy) {
    matchFilter['endedBy'] = { $eq: endedBy };
  }

  if (dateRange && dateRange !== 'all') {
    const { startOfDate, endOfDate } = buildDateRange(dateRange, startDate, endDate);

    if (startOfDate && endOfDate) {
      matchFilter['$expr'] = {
        $and: [
          { $gte: [{ $toDate: '$_id' }, startOfDate] },
          { $lte: [{ $toDate: '$_id' }, endOfDate] },
        ],
      };
    }
  }

  return matchFilter;
};

export const buildAction = (measures: string[]): Record<string, any> => {
  const actions: Record<string, any> = {};

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

export const buildPipeline = (filter: any, matchFilter: any): any[] => {
  const {
    dimension: dimensions,
    measure: measures,
    frequencyType = '%m',
    sortBy,
  } = filter;

  const pipeline: any[] = [];
  const matchStage: Record<string, any> = {};

  if ((dimensions || []).some((d: string) => ['brand', 'channel', 'integration'].includes(d))) {
    matchStage['integrationId'] = { $ne: null };
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

  if ((dimensions || []).includes('queue')) {
    matchStage['queueName'] = { $ne: null };
  }

  if ((dimensions || []).includes('operator')) {
    matchStage['operatorPhone'] = { $ne: null };
  }

  if ((dimensions || []).includes('customer')) {
    matchStage['customerPhone'] = { $ne: null };
  }

  pipeline.push({ $match: { ...matchStage, ...matchFilter } });

  if ((dimensions || []).includes('brand')) {
    pipeline.push(
      {
        $lookup: {
          from: 'integrations',
          localField: 'integrationId',
          foreignField: '_id',
          as: 'integration',
        },
      },
      { $unwind: '$integration' },
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
    groupStage.$group._id['createdAt'] = { $toDate: '$_id' };
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
    groupStage.$group._id['channel'] = '$integrationId';
  }

  if ((dimensions || []).includes('integration')) {
    groupStage.$group._id['integration'] = '$integrationId';
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
        date: { $toDate: '$_id' },
      },
    };
  }

  if (
    ((dimensions || []).includes('frequency') && frequencyType === '%Y-%m-%d %H:%M:%S') ||
    (dimensions || []).includes('record')
  ) {
    groupStage.$group.doc = { $first: '$$ROOT' };
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
      { $unwind: '$user' },
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
      { $unwind: '$brand' },
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
      { $unwind: '$channel' },
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
      { $unwind: '$integration' },
    );
  }

  const projectStage: any = { $project: { _id: 0 } };

  (measures || []).forEach((measure: string) => {
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

  if (
    ((dimensions || []).includes('frequency') && frequencyType === '%Y-%m-%d %H:%M:%S') ||
    (dimensions || []).includes('record')
  ) {
    projectStage.$project['conversationId'] = '$doc.erxesApiId';
  }

  pipeline.push(projectStage);

  if (sortBy?.length) {
    const sortFields = (sortBy || []).reduce((acc: Record<string, any>, { field, direction }) => {
      acc[field] = direction;
      return acc;
    }, {});
    pipeline.push({ $sort: sortFields });
  }

  return pipeline;
};

export const formatWeek = (frequency: string): string => {
  const [year, week] = frequency?.split('-') || [];

  const startOfDate = (dayjs() as any).year(Number(year)).isoWeek(Number(week)).startOf('isoWeek').format('MM/DD');
  const endOfDate = (dayjs() as any).year(Number(year)).isoWeek(Number(week)).endOf('isoWeek').format('MM/DD');

  return `Week ${week} ${startOfDate}-${endOfDate}`;
};

export const formatMonth = (frequency: string): string => {
  const MONTH_NAMES: Record<string, string> = {
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

  return MONTH_NAMES[frequency] || frequency;
};

export const formatFrequency = (frequencyType: string, frequency: string): string => {
  switch (frequencyType) {
    case '%Y-%V':
      return formatWeek(frequency);
    case '%m':
      return formatMonth(frequency);
    case '%Y-%m-%d %H:%M:%S':
      return dayjs(new Date(frequency)).format('YYYY-MM-DD h:mm:ss A');
    case '%Y':
    case '%Y-%m-%d':
      return frequency;
    default:
      return frequency;
  }
};

export const formatData = (data: any[], frequencyType: string): any[] => {
  return data.map((item) => {
    const formatted = { ...item };

    if (formatted.hasOwnProperty('teamMember')) {
      const user = formatted['teamMember'];
      formatted['teamMember'] =
        user?.details?.fullName ||
        `${user?.details?.firstName || ''} ${user?.details?.lastName || ''}`.trim() ||
        user?.email;
    }

    if (formatted.hasOwnProperty('frequency')) {
      formatted['frequency'] = formatFrequency(frequencyType, formatted['frequency']);
    }

    if (formatted.hasOwnProperty('createdAt')) {
      const timeZoneOffset = Number(process.env.TIMEZONE || 8);
      formatted['createdAt'] = dayjs
        .utc(formatted['createdAt'])
        .add(timeZoneOffset, 'hour')
        .format('YYYY/MM/DD h:mm A');
    }

    ['totalDuration', 'averageDuration'].forEach((key) => {
      if (formatted.hasOwnProperty(key) && formatted[key]) {
        formatted[key] = formatted[key] * 1000;
      }
    });

    ['type', 'status', 'endedBy'].forEach((key) => {
      if (formatted.hasOwnProperty(key)) {
        formatted[key] = CALLPRO_STATE_LABELS[formatted[key]] || formatted[key];
      }
    });

    if (
      (formatted.hasOwnProperty('frequency') && formatted.hasOwnProperty('conversationId')) ||
      formatted.hasOwnProperty('record')
    ) {
      formatted.url = `/inbox/index?_id=${formatted.conversationId}`;
      delete formatted['conversationId'];
    }

    return formatted;
  });
};

export const buildChartData = (data: any[], measures: string[], dimensions: string[]) => {
  const datasets = (data || []).map((item) => item[measures[0]]);
  const labels = (data || []).map((item) => item[dimensions[0]]);

  return { data: datasets, labels };
};

export const buildTableData = (data: any[], measures: string[], dimensions: string[]) => {
  const reorderedData = data.map((item) => {
    const order: any = {};

    (dimensions || []).forEach((dimension) => {
      order[dimension] = item[dimension];
    });

    (measures || []).forEach((measure) => {
      order[measure] = item[measure];
    });

    if (item.hasOwnProperty('url')) {
      order.url = item.url || '';
    }

    return order;
  });

  let total: any = '-';

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

  return {
    data: [...reorderedData, total],
    headers: [...dimensions, ...measures],
  };
};

export const buildData = ({
  chartType,
  data,
  measure,
  dimension,
  frequencyType,
}: {
  chartType: string;
  data: any[];
  measure: string[];
  dimension: string[];
  frequencyType: string;
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
      return { data, labels: [] };
  }
};
