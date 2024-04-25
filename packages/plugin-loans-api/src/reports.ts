import { IUserDocument } from '@erxes/api-utils/src/types';
import { sendCoreMessage } from './messageBroker';
import * as dayjs from 'dayjs';
import { IModels, generateModels } from './connectionResolver';
import { loanExpiredReportData } from './reports/loanExpiredReportData';

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

const chartTemplates = [
  {
    templateType: 'loanExpiredReportData',
    serviceType: 'loans',
    name: 'Loan Expired Data',
    chartTypes: [
      'table'
    ],
    getChartResult: async (
    ) => {
        

      const data = [0,1,5,6,5] 

      const labels = ['normal','expired','doubtful','negative','bad'] 

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
