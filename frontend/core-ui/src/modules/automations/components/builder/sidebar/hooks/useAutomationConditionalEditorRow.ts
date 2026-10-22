import { TAutomationCondition, TAutomationConditionalRow } from 'ui-modules';
import { createEmptyCondition, describeConditionalRow } from 'ui-modules';

export const useAutomationConditionalEditorRow = ({
  row,
  onChange,
}: {
  row: TAutomationConditionalRow;
  onChange: (patch: Partial<TAutomationConditionalRow>) => void;
}) => {
  const conjunction = row.conjunction || 'and';

  return {
    summary: describeConditionalRow(row),
    conjunction,
    toggleConjunction: () =>
      onChange({ conjunction: conjunction === 'and' ? 'or' : 'and' }),
    updateCondition: (index: number, condition: TAutomationCondition) =>
      onChange({
        conditions: row.conditions.map((current, currentIndex) =>
          currentIndex === index ? condition : current,
        ),
      }),
    removeCondition: (index: number) =>
      onChange({
        conditions: row.conditions.filter(
          (_condition, currentIndex) => currentIndex !== index,
        ),
      }),
    addCondition: () =>
      onChange({ conditions: [...row.conditions, createEmptyCondition()] }),
    setValues: (values: Record<string, unknown>) => onChange({ values }),
  };
};
