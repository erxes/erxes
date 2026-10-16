import { TAutomationConditional, TAutomationConditionalRow } from 'ui-modules';
import {
  createEmptyConditionalRow,
  validateAutomationConditional,
} from 'ui-modules';

export const useAutomationConditionalEditor = ({
  conditional,
  onChange,
}: {
  conditional: TAutomationConditional;
  onChange: (conditional: TAutomationConditional) => void;
}) => {
  const { rows } = conditional;

  const setRows = (next: TAutomationConditionalRow[]) =>
    onChange({ ...conditional, rows: next });

  const addRow = () => {
    const row = createEmptyConditionalRow(rows.map(({ id }) => id));

    setRows([...rows, row]);
  };

  const removeRow = (rowId: string) =>
    setRows(rows.filter((row) => row.id !== rowId));

  const moveRow = (rowId: string, direction: -1 | 1) => {
    const index = rows.findIndex((row) => row.id === rowId);
    const target = index + direction;

    if (index === -1 || target < 0 || target >= rows.length) {
      return;
    }

    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    setRows(next);
  };

  const updateRow = (
    rowId: string,
    patch: Partial<TAutomationConditionalRow>,
  ) =>
    setRows(rows.map((row) => (row.id === rowId ? { ...row, ...patch } : row)));

  const updateOtherwise = (values: Record<string, unknown>) =>
    onChange({ ...conditional, otherwise: values });

  return {
    rows,
    addRow,
    removeRow,
    moveRow,
    updateRow,
    updateOtherwise,
    errors: validateAutomationConditional(conditional),
  };
};
