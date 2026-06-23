import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { Form } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PlaceholderInput, TPlaceholderInputSuggestion } from 'ui-modules';

export const AiAgentInputFields = () => {
  const { control } = useFormContext<TAiAgentConfigForm>();
  const { t } = useTranslation('automations');

  return (
    <div className="grid gap-3 rounded-md border bg-muted/20 p-4">
      <Form.Field
        control={control}
        name="input"
        render={({ field: { disabled: _disabled, ...field } }) => (
          <Form.Item>
            <Form.Label>{t('ai-agent-input')}</Form.Label>
            <PlaceholderInput
              {...field}
              value={field.value || ''}
              disabled={[
                TPlaceholderInputSuggestion.Date,
                TPlaceholderInputSuggestion.Emoji,
              ]}
            />
            <Form.Description>
              {t('ai-agent-input-description')}
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
