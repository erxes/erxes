import { useManagePropertyCustomInput } from '@/automations/components/builder/nodes/actions/manageProperties/hooks/useManagePropertyCustomInput';
import {
  describeManagePropertyRule,
  useManagePropertyRule,
} from '@/automations/components/builder/nodes/actions/manageProperties/hooks/useManagePropertyRule';
import { useCallback, useMemo, useState } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { TAutomationField } from 'ui-modules';

const groupLabelOf = (key: string, fields: TAutomationField[]) =>
  fields.find(({ group }) => group === key)?.groupDetail?.name || key;

const hasText = (value: unknown) => !!String(value ?? '').trim();

/**
 * One rule card: the rule's form hook plus what the card shows around it —
 * field groups with their names, a one-line summary, the plugin's own value
 * input when the field has one, and the optional "else" value.
 */
export const useManagePropertyRuleCard = ({
  propertyType,
  sourceType,
  index,
}: {
  propertyType: string;
  sourceType: string;
  index: number;
}) => {
  const rule = useManagePropertyRule({ propertyType, sourceType, index });
  const CustomInput = useManagePropertyCustomInput(
    propertyType,
    rule.selectedField,
  );
  const [showFallback, setShowFallback] = useState(() =>
    hasText(rule.rule?.fallbackValue),
  );
  const metaPath = `rules.${index}.meta`;

  const groupOptions = useMemo(
    () =>
      Object.entries(rule.groups).map(([key, fields]) => ({
        key,
        label: groupLabelOf(key, fields),
        fields,
      })),
    [rule.groups],
  );

  const openFallback = useCallback(() => setShowFallback(true), []);

  const removeFallback = useCallback(() => {
    rule.setValue(`rules.${index}.fallbackValue`, undefined, {
      shouldDirty: true,
    });
    setShowFallback(false);
  }, [rule, index]);

  const onInputModeChange = useCallback(
    (mode: string) =>
      rule.handleUpdate({ isExpression: mode === 'expression' }),
    [rule],
  );

  const metaOf = useCallback(
    (valueForm: UseFormReturn<FieldValues>) => valueForm.watch(metaPath),
    [metaPath],
  );

  const changeMetaOf = useCallback(
    (valueForm: UseFormReturn<FieldValues>) => (meta: unknown) =>
      valueForm.setValue(metaPath, meta, { shouldDirty: true }),
    [metaPath],
  );

  return {
    ...rule,
    CustomInput,
    // A custom input stores ids, which read as noise in a one-line summary
    summary: describeManagePropertyRule(
      rule.rule,
      rule.operators,
      !CustomInput,
    ),
    groupOptions,
    showFallbackInput: !CustomInput && showFallback,
    showFallbackButton: !CustomInput && !showFallback,
    openFallback,
    removeFallback,
    onInputModeChange,
    metaOf,
    changeMetaOf,
  };
};
