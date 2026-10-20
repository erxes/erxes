import {
  AiAgentObjectFieldBuilder,
  TAiAgentFieldsGroupName,
} from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentObjectFieldBuilder';
import {
  AiAgentRow,
  AiAgentRowList,
} from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentRowList';
import { useAiAgentRowList } from '@/automations/components/builder/nodes/actions/aiAgent/hooks/useAiAgentRowList';
import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { Badge } from 'erxes-ui';
import {
  FieldArrayPath,
  useFieldArray,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { generateAutomationElementId } from 'ui-modules';

type TAiAgentObjectField = Extract<
  TAiAgentConfigForm,
  { goalType: 'classification' }
>['objectFields'][number];

const getObjectFieldLabel = (field?: TAiAgentObjectField) =>
  field?.fieldName || '';

export const AiAgentObjectBuilder = ({
  name = 'objectFields',
}: {
  name?: TAiAgentFieldsGroupName;
}) => {
  const { t } = useTranslation('automations');
  const { control } = useFormContext<TAiAgentConfigForm>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as FieldArrayPath<TAiAgentConfigForm>,
  });
  const values = (useWatch({ control, name }) || []) as TAiAgentObjectField[];
  const list = useAiAgentRowList({
    name,
    fields,
    values,
    getLabel: getObjectFieldLabel,
  });

  const handleAdd = () => {
    const id = generateAutomationElementId();
    append({
      id,
      fieldName: '',
      prompt: '',
      dataType: 'string',
      validation: '',
      options: [],
    });
    list.openRow(id);
  };

  return (
    <AiAgentRowList
      openId={list.openId}
      onOpenChange={list.setOpenId}
      search={list.search}
      onSearchChange={list.setSearch}
      showSearch={list.showSearch}
      hasNoMatch={list.hasNoMatch}
      isEmpty={!fields.length}
      errorMessage={list.listErrorMessage}
      addLabel={t('ai-agent-add-field')}
      onAdd={handleAdd}
    >
      {fields.map((field, index) => {
        const { id } = list.items[index];
        const value = values[index];

        if (!list.isVisible(id)) {
          return null;
        }

        return (
          <AiAgentRow
            key={field.id}
            value={id}
            title={value?.fieldName || ''}
            badges={
              <Badge variant="secondary" className="shrink-0">
                {value?.dataType === 'option'
                  ? t('ai-agent-option-count', {
                      count: value.options?.length || 0,
                    })
                  : value?.dataType}
              </Badge>
            }
            preview={value?.prompt}
            hasError={list.hasError(id)}
            onRemove={() => remove(index)}
          >
            <AiAgentObjectFieldBuilder name={name} index={index} />
          </AiAgentRow>
        );
      })}
    </AiAgentRowList>
  );
};
