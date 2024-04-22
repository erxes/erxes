import { IUserDocument } from '@erxes/api-utils/src/types';
import { sendCoreMessage } from './messageBroker';
import * as dayjs from 'dayjs';
import { IModels, generateModels } from './connectionResolver';
import { loanExpiredReportData } from './reports/loanExpiredReportData';

const MMSTOMINS = 60000;

const MMSTOHRS = MMSTOMINS * 60;

const INBOX_TAG_TYPE = 'inbox:conversation';

const NOW = new Date();

const reportTemplates = [
  {
    serviceType: 'loans',
    title: 'Loans chart',
    serviceName: 'loans',
    description: 'Chat conversation charts',
    charts: ['loanExpiredReportData'],
    img: 'https://sciter.com/wp-content/uploads/2022/08/chart-js.png'
  }
];

const checkFilterParam = (param: any) => {
  return param && param.length;
};

const DATERANGE_TYPES = [
  { label: 'All time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Week', value: 'thisWeek' },
  { label: 'Last Week', value: 'lastWeek' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'This Year', value: 'thisYear' },
  { label: 'Last Year', value: 'lastYear' },
  { label: 'Custom Date', value: 'customDate' }
];

const INTEGRATION_TYPES = [
  { label: 'XOS Messenger', value: 'messenger' },
  { label: 'Email', value: 'email' },
  { label: 'Call', value: 'calls' },
  { label: 'Callpro', value: 'callpro' },
  { label: 'SMS', value: 'sms' },
  { label: 'Facebook Messenger', value: 'facebook-messenger' },
  { label: 'Facebook Post', value: 'facebook-post' },
  { label: 'All', value: 'all' }
];

const calculateAverage = (arr: number[]) => {
  if (!arr || !arr.length) {
    return 0; // Handle division by zero for an empty array
  }

  const sum = arr.reduce((acc, curr) => acc + curr, 0);
  return (sum / arr.length).toFixed();
};

const returnDateRange = (dateRange: string, startDate: Date, endDate: Date) => {
  const startOfToday = new Date(NOW.setHours(0, 0, 0, 0));
  const endOfToday = new Date(NOW.setHours(23, 59, 59, 999));
  const startOfYesterday = new Date(
    dayjs(NOW).add(-1, 'day').toDate().setHours(0, 0, 0, 0)
  );

  let $gte;
  let $lte;

  switch (dateRange) {
    case 'today':
      $gte = startOfToday;
      $lte = endOfToday;
      break;
    case 'yesterday':
      $gte = startOfYesterday;
      $lte = startOfToday;
    case 'thisWeek':
      $gte = dayjs(NOW).startOf('week').toDate();
      $lte = dayjs(NOW).endOf('week').toDate();
      break;

    case 'lastWeek':
      $gte = dayjs(NOW).add(-1, 'week').startOf('week').toDate();
      $lte = dayjs(NOW).add(-1, 'week').endOf('week').toDate();
      break;
    case 'lastMonth':
      $gte = dayjs(NOW).add(-1, 'month').startOf('month').toDate();
      $lte = dayjs(NOW).add(-1, 'month').endOf('month').toDate();
      break;
    case 'thisMonth':
      $gte = dayjs(NOW).startOf('month').toDate();
      $lte = dayjs(NOW).endOf('month').toDate();
      break;
    case 'thisYear':
      $gte = dayjs(NOW).startOf('year').toDate();
      $lte = dayjs(NOW).endOf('year').toDate();
      break;
    case 'lastYear':
      $gte = dayjs(NOW).add(-1, 'year').startOf('year').toDate();
      $lte = dayjs(NOW).add(-1, 'year').endOf('year').toDate();
      break;
    case 'customDate':
      $gte = new Date(startDate);
      $lte = new Date(endDate);
      break;
    // all
    default:
      break;
  }

  if ($gte && $lte) {
    return { $gte, $lte };
  }

  return {};
};

const chartTemplates = [
  {
    templateType: 'loanExpiredReportData',
    serviceType: 'loans',
    name: 'Loan Expired Data',
    chartTypes: [
      'table'
    ],
    getChartResult: async (
      models: IModels,
      filter: any,
      dimension: any,
      subdomain: string
    ) => {
        
    console.log('filter',filter)

      const rdata = await loanExpiredReportData(models,filter)

      console.log('rdata',rdata)

      const data = [0,1,5,6,5] //Object.values(usersMap).map((t: any) => t.avgRespondtime);

      const labels = ['normal','expired','doubtful','negative','bad'] //Object.values(usersMap).map((t: any) => t.fullName);

      const title = 'Loan expiration Data';

      const datasets = { title, data, labels };

      return datasets;
    },

    filterTypes: [
      {
        fieldName: 'leaseExpertId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'users',
        fieldLabel: 'Select lease expert'
      },
      {
        fieldName: 'branchId',
        fieldType: 'select',
        multi: false,
        fieldQuery: 'branches',
        fieldLabel: 'Select branches'
      },
      {
        fieldName: 'customerId',
        fieldType: 'select',
        fieldQuery: 'customers',
        multi: false,
        fieldOptions: 'customerId',
        fieldLabel: 'Select source'
      }
    ]
  }
];

const getChartResult = async ({ subdomain, data }) => {
  const models = await generateModels(subdomain);
  const { templateType, filter, dimension } = data;

  const template =
    chartTemplates.find((t) => t.templateType === templateType) || ({} as any);

  return template.getChartResult(models, filter, dimension, subdomain);
};

export default {
  chartTemplates,
  reportTemplates,
  getChartResult
};
