import {
  DECISION_TABLE_ANY,
  splitDecisionCell,
} from '@/automations/components/builder/nodes/actions/decisionTable/utils/decisionTableCells';

// A list cell is either "*" or a comma list; picking nothing falls back to "*"
export const useDecisionTableListCell = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const isAny = value.trim() === DECISION_TABLE_ANY;
  const selected = isAny ? [] : splitDecisionCell(value);

  const setSelected = (next: string[]) =>
    onChange(next.length ? next.join(', ') : DECISION_TABLE_ANY);

  const toggle = (item: string) =>
    setSelected(
      selected.includes(item)
        ? selected.filter((current) => current !== item)
        : [...selected, item],
    );

  const setAny = () => onChange(DECISION_TABLE_ANY);

  const setFromPicker = (picked: string | string[] | null) =>
    setSelected(Array.isArray(picked) ? picked : picked ? [picked] : []);

  return { isAny, selected, toggle, setFromPicker, setAny };
};
