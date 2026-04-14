import { TActivityLog } from '../types';

export const usePropertiesFieldChangeSentence = (activity: TActivityLog) => {
  const { changes } = activity || {};

  const {
    fieldName: fieldLabel = 'property',
    fieldType,
    fieldOptions = [],
    prev: previousValue,
    current: currentValue,
    type: actionType,
    added,
    removed,
  } = changes || {};

  return {
    fieldLabel,
    fieldType,
    fieldOptions,
    previousValue,
    currentValue,
    actionType,
    added,
    removed,
  };
};
