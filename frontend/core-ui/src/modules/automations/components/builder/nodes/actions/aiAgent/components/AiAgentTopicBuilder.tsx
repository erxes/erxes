import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { IconTrash } from '@tabler/icons-react';
import { Button, Form, Input, Textarea } from 'erxes-ui';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { generateAutomationElementId } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const AiAgentTopicBuilder = () => {
  const { t } = useTranslation('automations');
  const { control } = useFormContext<TAiAgentConfigForm>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'topics',
  });

  return (
    <>
      <div className="flex flex-col gap-2 py-4">
        {fields.map((field, index) => (
          <div key={field.id} className="mb-1 flex flex-col gap-2">
            <div className="flex flex-row gap-2">
              <Controller
                name={`topics.${index}.topicName`}
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder={t('enter-topic-label', 'Enter topic label')} />
                )}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="ml-auto"
                onClick={() => remove(index)}
              >
                <IconTrash />
              </Button>
            </div>

            <Controller
              name={`topics.${index}.prompt`}
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder={t('explain-topic-selection', 'Explain when this topic should be selected')}
                />
              )}
            />
          </div>
        ))}
      </div>
      <Form.Message />
      <Button
        type="button"
        onClick={() =>
          append({
            id: generateAutomationElementId(),
            topicName: `Topic ${fields.length + 1}`,
            prompt: '',
          })
        }
      >
        {t('add-topic', 'Add Topic')}
      </Button>
    </>
  );
};
