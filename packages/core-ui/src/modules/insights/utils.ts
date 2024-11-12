import _ from 'lodash';
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
    static: hasLayout ? i.layout.static : false,
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
  const keys = path?.split('.');

  if (!keys) {
    return {}
  }

  return keys.reduce(
    (acc, key) => (acc && acc[key] !== 'undefined' ? acc[key] : undefined),
    obj,
  );
};

export const extractData = (data: any) => {

  if ((data || {}).hasOwnProperty('list')) {
    return (data as any || {}).list || []
  }

  return data
}

export const generateOptions = (data, parentData, filterType) => {

  const { fieldValueVariable, fieldLabelVariable, fieldParentVariable } = filterType

  const extractedData = extractData(data)

  const options = (extractedData || []).map((item) => ({
    value: getValue(item, fieldValueVariable),
    label: getValue(item, fieldLabelVariable),
    ...(fieldParentVariable && {
      parent: getValue(item, fieldParentVariable),
    }),
  }))

  if (fieldParentVariable === 'contentType' && options?.length) {
    const groupedOptions = Object.entries(
      options.reduce((acc, { label, value, parent }) => {

        const contentType = parent.split(':').pop();
        if (!acc[contentType]) {
          acc[contentType] = [];
        }

        acc[contentType].push({ label, value });

        return acc;
      }, {})
    ).map(([label, options]) => ({ label, options }));

    return groupedOptions
  }

  if (fieldParentVariable && parentData?.length && options?.length) {
    const groupedOptions = (parentData || []).map(parent => {
      const children = (options || []).filter(option => option.parent === parent._id).map(option => ({
        value: option.value,
        label: option.label,
      }));

      return {
        label: parent.name,
        options: children,
      };
    });

    return groupedOptions
  }

  return options
}

export const generateSubOptions = (data, fieldValues, filterType) => {
  const { fieldName, fieldLabelVariable, fieldExtraVariables } = filterType;

  if (!fieldExtraVariables?.length) return [];

  const filteredData = (data || []).filter(item =>
    (fieldValues[fieldName] || []).includes(item._id)
  );

  return filteredData.map(item => ({
    label: item[fieldLabelVariable],
    options: item.options.map(optionValue => ({
      label: optionValue,
      value: optionValue
    }))
  }));
};

export const getVariables = (fieldValues, filterType) => {

  const { logics, fieldQueryVariables } = filterType

  const logicFieldVariables = {};

  if (logics) {
    for (const logic of logics) {
      const { logicFieldName, logicFieldVariable, logicFieldExtraVariable } = logic;

      if (logicFieldExtraVariable) {
        Object.assign(logicFieldVariables, JSON.parse(logicFieldExtraVariable));
      }

      if (logicFieldVariable) {
        const logicFieldValue = fieldValues[logicFieldName];
        if (logicFieldValue) {
          logicFieldVariables[logicFieldVariable] = logicFieldValue;
        }
      }
    }
  }

  if (Object.values(logicFieldVariables).length) {
    return logicFieldVariables
  }

  return fieldQueryVariables ? JSON.parse(fieldQueryVariables) : {}
}

export const commarizeNumbers = (number: number) => {
  if (!number) {
    return null;
  }

  let strNum = number.toString();

  let parts = strNum.split('.');
  let integerPart = parts[0];
  let decimalPart = parts.length > 1 ? '.' + parts[1] : '';

  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');


  return (integerPart + decimalPart.substring(0, 3))
};

export const abbrevateNumbers = (number) => {
  if (number < 1e3) {
    return number;
  }
  if (number >= 1e3 && number < 1e6) {
    return +(number / 1e3).toFixed(1) + 'K';
  }
  if (number >= 1e6 && number < 1e9) {
    return +(number / 1e6).toFixed(1) + 'M';
  }
  if (number >= 1e9 && number < 1e12) {
    return +(number / 1e9).toFixed(1) + 'B';
  }
  if (number >= 1e12) {
    return +(number / 1e12).toFixed(1) + 'T';
  }
};

export const formatNumbers = (value: number, type?: string, axis?: string) => {

  if (!value) {
    return "-"
  }

  if (type === "time") {
    return formatMillisecond(value, axis)
  }

  if (type === 'commarize') {
    return commarizeNumbers(value);
  }

  return abbrevateNumbers(value);
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

export const generateParentOptionsFromQuery = (
  queryFieldOptions: any[],
  parentData: any[] = [],
) => {
  return parentData.reduce((acc, data) => {
    const options = queryFieldOptions
      .filter((option) => option?.parent === data._id)
      .map(({ value, label }) => ({ value, label }));

    if (options.length > 0) {
      acc.push({ label: data.name, options });
    }
    return acc;
  }, []);
};

export const generateParentOptionsFromField = (queryFieldOptions: any[]) => {
  return queryFieldOptions.reduce((acc, option) => {
    const contentType = option.parent.split(':').pop() || option.parent;
    const existingContentType = acc.find((item) => item.label === contentType);

    if (existingContentType) {
      existingContentType.options.push({
        label: option.label.trim(),
        value: option.value,
      });
    } else {
      acc.push({
        label: contentType,
        options: [{ label: option.label.trim(), value: option.value }],
      });
    }
    return acc;
  }, []);
};

export const compareValues = (a: any, b: any, operator: string) => {

  switch (operator) {
    case 'eq':
      return a === b;
    case 'ne':
      return a !== b;
    default:
      return a === b;
  }
}

export const hexToRgba = (hex: string, alpha: number) => {

  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `rgba(${r},${g},${b},${alpha})`;
};

export const rgbaToHex = (rgba: string) => {

  if (typeof rgba !== 'string') return null

  const rgbaValues = rgba.match(/\d+/g);
  if (!rgbaValues || rgbaValues.length < 3) return null;

  const r = parseInt(rgbaValues[0]).toString(16).padStart(2, '0');
  const g = parseInt(rgbaValues[1]).toString(16).padStart(2, '0');
  const b = parseInt(rgbaValues[2]).toString(16).padStart(2, '0');

  return `#${r}${g}${b}`;
};

export const generateInitialOptions = (options, selectedValues) => {

  if (selectedValues === null || selectedValues === undefined) {
    selectedValues = [];
  }

  if (!Array.isArray(selectedValues)) {
    selectedValues = [selectedValues];
  }

  const selectedValueArray = selectedValues.map(item => {
    if (typeof item === 'string' || typeof item === 'boolean') {
      return { value: item };
    }

    if (typeof item === 'object') {
      return {
        value: item.value,
        extraValues: { ...item }
      };
    }
  }).filter(item => item);

  return selectedValueArray.map(selectedValue => {
    let matchedOption;

    options.some(option => {
      if (option.options && Array.isArray(option.options)) {

        const nestedMatch = option.options.find(o => o.value === selectedValue.value);

        if (nestedMatch) {

          matchedOption = { ...nestedMatch, ...selectedValue.extraValues };
          return true;
        }

      } else if (option.value === selectedValue.value) {
        matchedOption = { ...option, ...selectedValue.extraValues };
        return true;
      }
    });

    return matchedOption;
  }).filter(item => item);
};

export const arrayMove = (array: any[], from: number, to: number) => {
  const slicedArray = array.slice();
  slicedArray.splice(
    to < 0 ? array.length + to : to,
    0,
    slicedArray.splice(from, 1)[0]
  );
  return slicedArray;
}

export const generateQuery = (fieldName, config, fieldValues?) => {
  const { fieldQueryVariables, fieldValueVariable, fieldParentVariable, fieldLabelVariable, fieldInitialVariable, fieldRequiredQueryParams, fieldExtraVariables = [], logics } = config;

  if (!fieldName || !fieldValueVariable || !fieldLabelVariable) {
    return ''
  }

  const variableDefinitions = JSON.parse(fieldQueryVariables || '{}');

  if (logics && fieldValues) {
    for (const logic of logics) {
      const { logicFieldName, logicFieldVariable } = logic;

      if (logicFieldVariable) {
        const logicFieldValue = fieldValues[logicFieldName];

        if (logicFieldValue) {
          variableDefinitions[logicFieldVariable] = logicFieldValue;
        }
      }
    }
  }

  const params = Object.entries(variableDefinitions).map(([key, value]) => {
    let graphqlType: string = typeof value;

    if (graphqlType === 'number') {
      graphqlType = 'int'
    }

    if (Array.isArray(value)) {
      graphqlType = '[String]'
    }

    const isRequired = (fieldRequiredQueryParams || []).includes(key)

    return `$${key}: ${String(graphqlType).charAt(0).toUpperCase() + String(graphqlType).slice(1)} ${isRequired && fieldValues ? '!' : ''}`;
  }).join(', ');

  const paramDeps = Object.entries(variableDefinitions).map(([key]) => {
    return `${key}: $${key}`
  }).join(',')

  const fields = fieldValues ? [
    fieldValueVariable,
    fieldLabelVariable,
    fieldParentVariable,
    ...fieldExtraVariables
  ].filter(Boolean).join(' ') : '_id name';

  const variableSection = fieldInitialVariable
    ? `${fieldInitialVariable} { ${fields} }`
    : fields;

  return `
    query ${fieldName} ${params ? '(' + params + ')' : ''} {
      ${fieldName} ${paramDeps ? '(' + paramDeps + ')' : ''} {
        ${variableSection}
      }
    }
  `;
};