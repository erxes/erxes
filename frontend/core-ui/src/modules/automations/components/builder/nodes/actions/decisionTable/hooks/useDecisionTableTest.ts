import { useDecisionTableFormContext } from '@/automations/components/builder/nodes/actions/decisionTable/context/DecisionTableFormContext';
import { toDecisionTableConfig } from '@/automations/components/builder/nodes/actions/decisionTable/states/decisionTableForm';
import {
  DECISION_TABLE_ANY,
  findDecisionTableRowIndex,
  splitDecisionCell,
  TDecisionTableOutputType,
} from '@/automations/components/builder/nodes/actions/decisionTable/utils/decisionTableCells';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';

export type TDecisionTableTestOutput = {
  key: string;
  type: TDecisionTableOutputType;
  value: string;
};

export type TDecisionTableTestResult =
  | { status: 'matched'; row: number; outputs: TDecisionTableTestOutput[] }
  | { status: 'default'; outputs: TDecisionTableTestOutput[] }
  | { status: 'fail' };

export const useDecisionTableTest = () => {
  const { form } = useDecisionTableFormContext();
  // Subscribes to every edit; the complete values are read below
  useWatch({ control: form.control });
  const [values, setValues] = useState<Record<string, string>>({});
  const [memberOf, setMemberOf] = useState<string[]>([]);

  const config = toDecisionTableConfig(form.getValues());

  // Only segments the table names can change the outcome
  const segmentIds = [
    ...new Set(
      config.rows.flatMap((row) =>
        config.inputs
          .filter(({ type }) => type === 'segment')
          .flatMap(({ key }) =>
            (row.when[key] ?? DECISION_TABLE_ANY).trim() === DECISION_TABLE_ANY
              ? []
              : splitDecisionCell(row.when[key]),
          ),
      ),
    ),
  ];

  const getResult = (): TDecisionTableTestResult => {
    const index = findDecisionTableRowIndex(config, values, new Set(memberOf));
    const outputsOf = (then: Record<string, string>) =>
      config.outputs.map(({ key, type }) => ({
        key,
        type,
        value: then[key] ?? '',
      }));

    if (index !== -1) {
      return {
        status: 'matched',
        row: index + 1,
        outputs: outputsOf(config.rows[index].then),
      };
    }

    return config.noMatch.mode === 'default'
      ? { status: 'default', outputs: outputsOf(config.noMatch.then) }
      : { status: 'fail' };
  };

  const setValue = (key: string, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const toggleSegment = (segmentId: string) =>
    setMemberOf((current) =>
      current.includes(segmentId)
        ? current.filter((id) => id !== segmentId)
        : [...current, segmentId],
    );

  return {
    inputs: config.inputs,
    outputs: config.outputs,
    values,
    setValue,
    segmentIds,
    memberOf,
    toggleSegment,
    result: getResult(),
  };
};
