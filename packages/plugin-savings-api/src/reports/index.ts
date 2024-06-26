import { generateModels } from "../connectionResolver";

import savingReportData from "./savingReportData";

const reportTemplates = [
  {
    serviceType: "savings",
    title: "Saving chart",
    serviceName: "savings",
    description: "Saving reports",
    charts: ["savingReportData"],
    img: "https://sciter.com/wp-content/uploads/2022/08/chart-js.png"
  }
];

const chartTemplates = [savingReportData];

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
