import { DEFAULT_GRID_DIMENSIONS } from './constants';

export const deserializeItem = (i) => {
  return {
    ...i,
    layout: i.layout ? JSON.parse(i.layout) : {},
    vizState: i.vizState ? JSON.parse(i.vizState) : {},
  };
};

export const defaultLayout = (i, index) => {
  const hasLayout = i && Object.keys(i.layout).length > 0;
  return {
    x: hasLayout ? i.layout.x : index % 2 === 0 ? 0 : 3,
    y: hasLayout ? i.layout.y : 0,
    w: hasLayout ? i.layout.w : DEFAULT_GRID_DIMENSIONS.w,
    h: hasLayout ? i.layout.h : DEFAULT_GRID_DIMENSIONS.h,
    minW: 1,
    minH: 1,
  };
};

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

export const getValue = (obj, path) => {
  const keys = path.split('.');
  return keys.reduce((acc, key) => (acc && acc[key] !== 'undefined' ? acc[key] : undefined), obj);
}

export const commarize = (value) => {
  const ranges = [
    { divider: 1e9, suffix: 'B' },
    { divider: 1e6, suffix: 'M' },
    { divider: 1e3, suffix: 'k' }
  ];

  const formatNumber = (n) => {
    for (let i = 0; i < ranges.length; i++) {
      if (n >= ranges[i].divider) {
        return (n / ranges[i].divider).toString() + ranges[i].suffix;
      }
    }
    return n;
  }

  return '$' + formatNumber(value);
}