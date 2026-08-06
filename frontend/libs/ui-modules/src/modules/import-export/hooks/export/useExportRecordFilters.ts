import { useState } from 'react';
import { TSystemFieldCondition } from '../../types/export/exportTypes';

const EMPTY_CONDITION: TSystemFieldCondition = {
  key: '',
  operator: 'eq',
  value: undefined,
};

const NO_VALUE_OPERATORS = new Set(['isSet', 'isNotSet', 'isTrue', 'isFalse']);

export const useExportRecordFilters = () => {
  const [conditions, setConditions] = useState<TSystemFieldCondition[]>([]);
  const enabled = conditions.length > 0;

  const handleEnableToggle = (checked: boolean) => {
    setConditions(checked ? [{ ...EMPTY_CONDITION }] : []);
  };

  const addCondition = () => {
    setConditions((prev) => [...prev, { ...EMPTY_CONDITION }]);
  };

  const updateCondition = (
    index: number,
    patch: Partial<TSystemFieldCondition>,
  ) => {
    setConditions((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    );
  };

  const removeCondition = (index: number) => {
    setConditions((prev) => prev.filter((_, i) => i !== index));
  };

  // Drop rows the user started but never finished (no field picked yet, or
  // an operator that needs a value but doesn't have one).
  const completedConditions = conditions.filter(
    (c) =>
      c.key &&
      (NO_VALUE_OPERATORS.has(c.operator) ||
        (c.value !== undefined && c.value !== '')),
  );

  return {
    conditions,
    completedConditions,
    enabled,
    handleEnableToggle,
    addCondition,
    updateCondition,
    removeCondition,
  };
};
