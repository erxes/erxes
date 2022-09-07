import { LogicParams } from './types';

const updateCustomFieldsCache = ({
  id,
  type,
  doc
}: {
  id?: string;
  type: string;
  doc?: any;
}) => {
  const storageKey = `erxes_${type}_columns_config`;
  const storageItem = localStorage.getItem(storageKey);

  if (!storageItem) {
    return;
  }

  const configs = JSON.parse(storageItem) || [];

  if (!id) {
    const _id = Math.random().toString();

    configs.push({
      _id,
      order: configs.length,
      checked: false,
      name: `customFieldsData.${_id}`,
      text: doc.text
    });

    return localStorage.setItem(storageKey, JSON.stringify(configs));
  }

  const key = `customFieldsData.${id}`;

  const items = !doc
    ? configs.filter(config => config.name !== key)
    : configs.map(config => {
        if (config.name === key) {
          return { ...config, label: doc.text };
        }

        return config;
      });

  localStorage.setItem(storageKey, JSON.stringify(items));
};

const checkLogic = (logics: LogicParams[]) => {
  const values: { [key: string]: boolean } = {};

  for (const logic of logics) {
    const {
      fieldId,
      operator,
      logicValue,
      fieldValue,
      validation,
      type
    } = logic;
    const key = `${fieldId}_${logicValue}`;
    values[key] = false;

    // if fieldValue is set
    if (operator === 'hasAnyValue') {
      if (fieldValue) {
        values[key] = true;
      } else {
        values[key] = false;
      }
    }

    // if fieldValue is not set
    if (operator === 'isUnknown') {
      if (!fieldValue) {
        values[key] = true;
      } else {
        values[key] = false;
      }
    }

    // if fieldValue equals logic value
    if (operator === 'is') {
      if (logicValue.toString() === fieldValue.toString()) {
        values[key] = true;
      } else {
        values[key] = false;
      }
    }

    // if fieldValue not equal to logic value
    if (operator === 'isNot') {
      if (logicValue !== fieldValue) {
        values[key] = true;
      } else {
        values[key] = false;
      }
    }

    if (validation === 'number') {
      // if number value: is greater than
      if (operator === 'greaterThan' && fieldValue) {
        if (Number(fieldValue) > Number(logicValue)) {
          values[key] = true;
        } else {
          values[key] = false;
        }
      }

      // if number value: is less than
      if (operator === 'lessThan' && fieldValue) {
        if (Number(fieldValue) < Number(logicValue)) {
          values[key] = true;
        } else {
          values[key] = false;
        }
      }
    }

    if (typeof logicValue === 'string') {
      // if string value contains logicValue
      if (operator === 'contains') {
        if (String(fieldValue).includes(logicValue)) {
          values[key] = true;
        } else {
          values[key] = false;
        }
      }

      // if string value does not contain logicValue
      if (operator === 'doesNotContain') {
        if (!String(fieldValue).includes(logicValue)) {
          values[key] = true;
        } else {
          values[key] = false;
        }
      }

      // if string value startsWith logicValue
      if (operator === 'startsWith') {
        if (String(fieldValue).startsWith(logicValue)) {
          values[key] = true;
        } else {
          values[key] = false;
        }
      }

      // if string value endsWith logicValue
      if (operator === 'endsWith') {
        if (!String(fieldValue).endsWith(logicValue)) {
          values[key] = true;
        } else {
          values[key] = false;
        }
      }
    }

    if (validation && validation.includes('date')) {
      const dateValueToCheck = new Date(String(fieldValue));
      const logicDateValue = new Date(String(logicValue));

      // date is greather than
      if (operator === 'dateGreaterThan') {
        if (dateValueToCheck > logicDateValue) {
          values[key] = true;
        } else {
          values[key] = false;
        }
      }

      // date is less than
      if (operator === 'dateLessThan') {
        if (logicDateValue > dateValueToCheck) {
          values[key] = true;
        } else {
          values[key] = false;
        }
      }
    }

    if (type === 'check') {
      if (
        fieldValue &&
        typeof fieldValue === 'string' &&
        typeof logicValue === 'string'
      ) {
        if (operator === 'isNot') {
          if (!fieldValue.includes(logicValue)) {
            values[key] = true;
          } else {
            values[key] = false;
          }
        }

        if (operator === 'is') {
          if (fieldValue.includes(logicValue)) {
            values[key] = true;
          } else {
            values[key] = false;
          }
        }
      }
    }
  }

  const result: any = [];

  for (const key of Object.keys(values)) {
    result.push(values[key]);
  }

  if (result.filter(val => !val).length === 0) {
    return true;
  }

  return false;
};

export { updateCustomFieldsCache, checkLogic };
