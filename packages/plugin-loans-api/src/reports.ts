import { generateModels } from './connectionResolver';
import loanExpirationReportData from './reports/loanExpiredReportData';
import loanReportData from './reports/loanReportData';

const reportTemplates = [
  {
    serviceType: 'loans',
    title: 'Loans chart',
    serviceName: 'loans',
    description: 'Chat conversation charts',
    charts: ['loanExpiredReportData', 'loanReportData'],
    img: 'https://sciter.com/wp-content/uploads/2022/08/chart-js.png'
  }
];

const chartTemplates = [loanReportData, loanExpirationReportData];

const getChartResult = async ({ subdomain, data }) => {
  const models = await generateModels(subdomain);

  const { templateType, filter, chartType } = data;

  const template =
    chartTemplates.find((t) => t.templateType === templateType) || ({} as any);

  return template.getChartResult(models, filter, chartType, subdomain);
};

export default {
  chartTemplates,
  reportTemplates,
  getChartResult
};
