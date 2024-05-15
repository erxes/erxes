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

export const commarizeNumbers = (number) => {

  if (number == null) {
    return "";
  }

  let strNum = number.toString();

  let parts = strNum.split(".");
  let integerPart = parts[0];
  let decimalPart = parts.length > 1 ? "." + parts[1] : "";

  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return integerPart + decimalPart;
}

export const abbrevateNumbers = (number) => {
  if (number < 1e3) { return number; }
  if (number >= 1e3 && number < 1e6) { return +(number / 1e3).toFixed(1) + "K"; }
  if (number >= 1e6 && number < 1e9) { return +(number / 1e6).toFixed(1) + "M"; }
  if (number >= 1e9 && number < 1e12) { return +(number / 1e9).toFixed(1) + "B"; }
  if (number >= 1e12) { return +(number / 1e12).toFixed(1) + "T"; }
}

export const formatNumbers = (value: number, axis?: string, type?: string) => {
  if (type === "time") {
    return formatMillisecond(value, axis)
  }

  if (type === "commarize") {
    return commarizeNumbers(value)
  }

  return abbrevateNumbers(value)
};

export const formatMillisecond = (milliseconds, axis) => {
  const msPerSecond = 1000;
  const msPerMinute = 60 * msPerSecond;
  const msPerHour = 60 * msPerMinute;
  const msPerDay = 24 * msPerHour;
  const msPerWeek = 7 * msPerDay;
  const msPerMonth = 30.44 * msPerDay;
  const msPerYear = 365.25 * msPerDay;

  if (axis === 'y') {
    if (milliseconds >= msPerYear) {
      return `${Math.floor(milliseconds / msPerYear)}Y`;
    } else if (milliseconds >= msPerMonth) {
      return `${Math.floor(milliseconds / msPerMonth)}M`;
    } else if (milliseconds >= msPerWeek) {
      return `${Math.floor(milliseconds / msPerWeek)}W`;
    } else if (milliseconds >= msPerDay) {
      return `${Math.floor(milliseconds / msPerDay)}D`;
    } else if (milliseconds >= msPerHour) {
      return `${Math.floor(milliseconds / msPerHour)}H`;
    } else if (milliseconds >= msPerMinute) {
      return `${Math.floor(milliseconds / msPerMinute)}M`;
    } else {
      return `${Math.floor(milliseconds / msPerSecond)}S`;
    }
  }

  let result: string[] = [];

  if (axis === 'x') {
    if (milliseconds >= msPerYear) {
      const years = Math.floor(milliseconds / msPerYear);
      result.push(`Years : ${years} `);
      milliseconds -= years * msPerYear;
    }
    if (milliseconds >= msPerMonth) {
      const months = Math.floor(milliseconds / msPerMonth);
      result.push(`Months : ${months} `);
      milliseconds -= months * msPerMonth;
    }
    if (milliseconds >= msPerWeek) {
      const weeks = Math.floor(milliseconds / msPerWeek);
      result.push(`Weeks : ${weeks} `);
      milliseconds -= weeks * msPerWeek;
    }
    if (milliseconds >= msPerDay) {
      const days = Math.floor(milliseconds / msPerDay);
      result.push(`Days : ${days} `);
      milliseconds -= days * msPerDay;
    }
    if (milliseconds >= msPerHour) {
      const hours = Math.floor(milliseconds / msPerHour);
      result.push(`Hours : ${hours} `);
      milliseconds -= hours * msPerHour;
    }
    if (milliseconds >= msPerMinute) {
      const minutes = Math.floor(milliseconds / msPerMinute);
      result.push(`Minutes : ${minutes} `);
      milliseconds -= minutes * msPerMinute;
    }
    if (milliseconds >= msPerSecond) {
      const seconds = Math.floor(milliseconds / msPerSecond);
      result.push(`Seconds : ${seconds} `);
      milliseconds -= seconds * msPerSecond;
    }

    return result;
  }
};

export const generateParentOptionsFromQuery = (queryFieldOptions: any[], parentData: any[] = []) => {
  return parentData.reduce((acc, data) => {
    const options = queryFieldOptions
      .filter(option => option?.parent === data._id)
      .map(({ value, label }) => ({ value, label }));

    if (options.length > 0) {
      acc.push({ label: data.name, options });
    }
    return acc;
  }, []);
}

export const generateParentOptionsFromField = (queryFieldOptions: any[]) => {
  return queryFieldOptions.reduce((acc, option) => {
    const contentType = option.parent.split(":").pop() || option.parent;
    const existingContentType = acc.find(item => item.label === contentType);

    if (existingContentType) {
      existingContentType.options.push({ label: option.label.trim(), value: option.value });
    } else {
      acc.push({ label: contentType, options: [{ label: option.label.trim(), value: option.value }] });
    }
    return acc;
  }, []);
}