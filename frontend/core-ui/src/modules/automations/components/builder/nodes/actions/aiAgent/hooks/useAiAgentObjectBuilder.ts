import { TAiAgentFieldsGroupName } from '@/automations/components/builder/nodes/actions/aiAgent/hooks/useAiAgentObjectField';
import { useAiAgentRowList } from '@/automations/components/builder/nodes/actions/aiAgent/hooks/useAiAgentRowList';
import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FieldArrayPath,
  useFieldArray,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { generateAutomationElementId } from 'ui-modules';

type TAiAgentObjectField = Extract<
  TAiAgentConfigForm,
  { goalType: 'classification' }
>['objectFields'][number];

const fieldLabelOf = (field?: TAiAgentObjectField) => field?.fieldName || '';

const newField = (id: string): TAiAgentObjectField => ({
  id,
  fieldName: '',
  prompt: '',
  dataType: 'string',
  validation: '',
  options: [],
});

/** The fields the agent fills, as rows: only those the search shows. */
export const useAiAgentObjectBuilder = (name: TAiAgentFieldsGroupName) => {
  const { t } = useTranslation('automations');
  const { control } = useFormContext<TAiAgentConfigForm>();

  // An option field shows how many options it has; others show their type
  const typeLabelOf = (field?: TAiAgentObjectField) =>
    field?.dataType === 'option'
      ? t('ai-agent-option-count', { count: field.options?.length || 0 })
      : field?.dataType || '';
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as FieldArrayPath<TAiAgentConfigForm>,
  });
  const values = (useWatch({ control, name }) || []) as TAiAgentObjectField[];
  const list = useAiAgentRowList({
    name,
    fields,
    values,
    getLabel: fieldLabelOf,
  });

  const rows = fields.flatMap((field, index) => {
    const { id } = list.items[index];
    const value = values[index];

    return list.isVisible(id)
      ? [
          {
            key: field.id,
            index,
            id,
            title: fieldLabelOf(value),
            preview: value?.prompt,
            typeLabel: typeLabelOf(value),
            hasError: list.hasError(id),
          },
        ]
      : [];
  });

  const handleAdd = useCallback(() => {
    const id = generateAutomationElementId();

    append(newField(id));
    list.openRow(id);
  }, [append, list]);

  return { list, isEmpty: !fields.length, rows, handleAdd, remove };
};
