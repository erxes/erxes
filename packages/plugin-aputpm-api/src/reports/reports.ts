import reportTemplates from './template/report';
import chartTemplates from './template/chart';
import { generateModels } from '../connectionResolver';

const getChartResult = async ({ subdomain, data }) => {
  const models = await generateModels(subdomain);
  const { templateType, filter, dimension } = data;

  const template =
    chartTemplates.find((t) => t.templateType === templateType) || ({} as any);

  return template.getChartResult(models, filter, dimension, subdomain);
};

export default {
  reportTemplates,
  chartTemplates,
  getChartResult,
};
