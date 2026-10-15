import {
  CONDITION_OPERATORS,
  TConditionProperty,
} from '@/automations/components/builder/sidebar/components/content/action/conditional/conditionProperties';
import { useAutomationBuilderSecondarySidebar } from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSecondarySidebar';
import {
  getConditionSourceScope,
  useConditionSourceProperties,
} from '@/automations/components/builder/sidebar/hooks/useConditionSourceProperties';
import {
  AUTOMATION_UNARY_OPERATORS,
  TAutomationCondition,
  TAutomationValueCondition,
} from 'ui-modules';

export const CUSTOM_CONDITION_SOURCE = 'custom';
export const SEGMENT_CONDITION_SOURCE = 'segment';

const TOKEN_SCOPE_REGEX = /^\{\{\s*(trigger|input|actions\.[^.\s]+)\./;

/**
 * The type picker names where the value comes from: a node, a segment, or a
 * hand-written expression. The node is read back from the token itself, so
 * saved conditions need no extra bookkeeping.
 */
export const useAutomationConditionRow = ({
  condition,
  onChange,
}: {
  condition: TAutomationCondition;
  onChange: (condition: TAutomationCondition) => void;
}) => {
  const { sourceNodes } = useAutomationBuilderSecondarySidebar();
  const valueCondition: TAutomationValueCondition | null =
    condition.kind === 'value' ? condition : null;

  const scopeOfToken = valueCondition?.left.match(TOKEN_SCOPE_REGEX)?.[1];
  const pickedSourceId = valueCondition?.meta?.sourceId as string | undefined;
  const source =
    sourceNodes.find((node) => node.id === pickedSourceId) ||
    sourceNodes.find(
      (node) => getConditionSourceScope(node) === scopeOfToken,
    ) ||
    null;

  const { properties, loading } = useConditionSourceProperties(source);
  const property: TConditionProperty | undefined = properties.find(
    ({ token }) => token === valueCondition?.left,
  );
  const operators = CONDITION_OPERATORS[property?.valueKind || 'text'];

  const typeValue =
    condition.kind === 'segment'
      ? SEGMENT_CONDITION_SOURCE
      : source?.id || CUSTOM_CONDITION_SOURCE;

  const setType = (next: string) => {
    if (next === SEGMENT_CONDITION_SOURCE) {
      onChange({ kind: 'segment', segmentId: '' });
      return;
    }

    onChange({
      kind: 'value',
      left: '',
      operator: 'e',
      right: '',
      meta: next === CUSTOM_CONDITION_SOURCE ? {} : { sourceId: next },
    });
  };

  const setProperty = (token: string) => {
    const next = properties.find((candidate) => candidate.token === token);

    onChange({
      kind: 'value',
      left: token,
      operator: CONDITION_OPERATORS[next?.valueKind || 'text'][0].value,
      right: '',
      meta: source ? { sourceId: source.id } : {},
    });
  };

  const update = (patch: Partial<TAutomationValueCondition>) => {
    if (!valueCondition) {
      return;
    }

    const next = { ...valueCondition, ...patch };

    onChange(
      AUTOMATION_UNARY_OPERATORS.includes(next.operator)
        ? { ...next, right: '' }
        : next,
    );
  };

  return {
    sourceNodes,
    typeValue,
    isCustom: condition.kind === 'value' && !source,
    properties,
    propertiesLoading: loading,
    property,
    operators,
    needsValue:
      !!valueCondition &&
      !AUTOMATION_UNARY_OPERATORS.includes(valueCondition.operator),
    setType,
    setProperty,
    setLeft: (left: string) => update({ left }),
    setOperator: (operator: string) => update({ operator }),
    setValue: (right: string) => update({ right }),
    setValueMeta: (inputMeta: Record<string, unknown>) =>
      update({ meta: { ...valueCondition?.meta, inputMeta } }),
    setSegment: (segmentId: string | string[] | null) =>
      onChange({
        kind: 'segment',
        segmentId: Array.isArray(segmentId)
          ? segmentId[0] || ''
          : segmentId || '',
      }),
  };
};
