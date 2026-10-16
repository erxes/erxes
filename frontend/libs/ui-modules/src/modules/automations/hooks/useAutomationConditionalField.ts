import { FieldValues, UseFormReturn, useWatch } from 'react-hook-form';
import { useAutomationConditionals } from '../contexts/AutomationConditionalsContext';
import { TAutomationConditionalFieldRender } from '../types/conditionalTypes';
import { generateAutomationElementId } from '../utils/automationUtils';
import {
  createEmptyConditionalRow,
  formatConditionalToken,
  getPathKey,
  parseConditionalToken,
} from '../utils/conditionalUtils';

export const useAutomationConditionalField = ({
  form,
  names,
  label,
  required,
  render,
}: {
  form: UseFormReturn<FieldValues>;
  names: string[];
  label: string;
  required?: boolean;
  render: TAutomationConditionalFieldRender;
}) => {
  const store = useAutomationConditionals();
  const primaryName = names[0];
  const keys = names.map(getPathKey);
  const primaryValue = useWatch({ control: form.control, name: primaryName });
  const tokenId = parseConditionalToken(primaryValue);
  const conditional = tokenId ? store?.conditionals[tokenId] : undefined;

  const openEditor = (id: string) =>
    store?.openEditor({ id, label, names, form, render });

  // The current value becomes Otherwise and the full editor opens on a first row
  const enable = () => {
    if (!store) {
      return;
    }

    const id = generateAutomationElementId(Object.keys(store.getSnapshot()));

    store.setConditional(id, {
      keys,
      label,
      required,
      rows: [createEmptyConditionalRow()],
      otherwise: Object.fromEntries(
        names.map((name, index) => [keys[index], form.getValues(name)]),
      ),
    });
    form.setValue(primaryName, formatConditionalToken(id), {
      shouldDirty: true,
    });
    openEditor(id);
  };

  // The otherwise values become the plain field values again
  const disable = () => {
    names.forEach((name, index) => {
      form.setValue(name, conditional?.otherwise?.[keys[index]] ?? '', {
        shouldDirty: true,
      });
    });
  };

  return {
    isSupported: !!store,
    isConditional: !!tokenId,
    // A token whose rules are not in the draft cannot be edited, only reset
    isBroken: !!tokenId && !conditional,
    conditional,
    errors: tokenId ? store?.errors[tokenId] || [] : [],
    enable,
    disable,
    edit: () => tokenId && openEditor(tokenId),
  };
};
