import { useTranslation } from 'react-i18next';
import {
  AiAgentObjectFieldBuilder,
  TAiAgentFieldsGroupName,
} from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentObjectFieldBuilder';
import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { Button, Label } from 'erxes-ui';
import { FieldArrayPath, useFieldArray, useFormContext } from 'react-hook-form';
import { generateAutomationElementId } from 'ui-modules';

export const AiAgentObjectBuilder = ({
  name = 'objectFields',
  addLabel = 'Add Classification Field',
}: {
  name?: TAiAgentFieldsGroupName;
  addLabel?: string;
}) => {
  const { t } = useTranslation('automations');
  const { control } = useFormContext<TAiAgentConfigForm>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as FieldArrayPath<TAiAgentConfigForm>,
  });

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="grid grid-cols-12 items-center gap-2">
        <Label className="col-span-5">{t('ai-agent-field-key')}</Label>
        <Label className="col-span-2">{t('ai-agent-data-type')}</Label>
        <Label className="col-span-4">{t('ai-agent-validation')}</Label>
        <div className="col-span-1" />
      </div>

      {fields.map((field, index) => (
        <AiAgentObjectFieldBuilder
          key={field.id}
          name={name}
          isLastElement={index + 1 !== fields.length}
          index={index}
          handleRemove={() => remove(index)}
        />
      ))}

      <Button
        type="button"
        onClick={() =>
          append({
            id: generateAutomationElementId(),
            fieldName: '',
            prompt: '',
            dataType: 'string',
            validation: '',
            options: [],
          })
        }
      >
        {addLabel}
      </Button>
    </div>
  );
};
