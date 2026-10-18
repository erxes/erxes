import { arrayMove } from '@dnd-kit/sortable';
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

  const reorderRows = (from: number, to: number) =>
    setRows(arrayMove(rows, from, to));

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
    reorderRows,
    updateRow,
    updateOtherwise,
    errors: validateAutomationConditional(conditional),
  };
};
