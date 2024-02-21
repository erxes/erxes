export const getService = (chart, reportTemplatesList) => {
  for (const template of reportTemplatesList) {
    if (template.charts.includes(chart.templateType)) {
      return {
        serviceName: template.serviceName,
        serviceType: template.serviceType,
      };
    }
  }
  return null;
};

export const groupServiceTypesByServiceName = (list) => {
  return list.reduce((acc, cur) => {
    if (!acc[cur.serviceName]) {
      acc[cur.serviceName] = [];
    }
    if (!acc[cur.serviceName].includes(cur.serviceType)) {
      acc[cur.serviceName].push(cur.serviceType);
    }
    return acc;
  }, {});
};

export const filterChartTemplates = (chartTemplates, reportTemplates, item) => {
  let serviceType = item?.serviceType;

  if (!item.serviceType) {
    if (item && item.charts && item.charts.length) {
      const service = getService(item.charts[0], reportTemplates);

      serviceType = service?.serviceType || '';
    }
  }

  const reportChartTypes = reportTemplates
    .filter((template) => template.serviceType === serviceType)
    .flatMap((template) => template.charts);

  const filteredChartTemplates = chartTemplates.filter((template) =>
    reportChartTypes.includes(template.templateType),
  );

  return filteredChartTemplates;
};
