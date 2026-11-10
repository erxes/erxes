import { AutomationConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';
import { Form, Select } from 'erxes-ui';
import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  PlaceholderInput,
  TAutomationActionProps,
  TPlaceholderInputSuggestion,
} from 'ui-modules';
import { usePickMemberForm } from '../hooks/usePickMemberForm';
import { TPickMemberConfigForm } from '../states/pickMemberConfigForm';

export const PickMemberConfigForm = ({
  handleSave,
  currentAction,
}: TAutomationActionProps<TPickMemberConfigForm>) => {
  const { t } = useTranslation('automations');
  const { form, propertyType } = usePickMemberForm(currentAction);
  const { control, handleSubmit } = form;

  return (
    <FormProvider {...form}>
      <AutomationConfigFormWrapper onSave={handleSubmit(handleSave)}>
        <Form.Field
          control={control}
          name="candidateIds"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('pick-member-candidates', 'Choose from')}</Form.Label>
              <PlaceholderInput
                propertyType={propertyType}
                value={field.value || ''}
                onChange={field.onChange}
                placeholderConfig={{
                  selectMode: 'many',
                  delimiter: ',',
                  allowOnlyTriggers: true,
                }}
                enabled={[TPlaceholderInputSuggestion.CallUser]}
              />
              <Form.Description className="text-xs">
                {t(
                  'pick-member-candidates-description',
                  'Inactive and unavailable members are left out. Availability is set on Team members.',
                )}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="method"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('pick-member-method', 'How to choose')}</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  <Select.Item value="roundRobin">
                    {t('pick-member-round-robin', 'Take turns')}
                  </Select.Item>
                  <Select.Item value="random">
                    {t('pick-member-random', 'At random')}
                  </Select.Item>
                </Select.Content>
              </Select>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="fallbackUserId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('pick-member-fallback', 'When nobody is available')}</Form.Label>
              <PlaceholderInput
                propertyType={propertyType}
                value={field.value || ''}
                onChange={field.onChange}
                placeholderConfig={{ selectMode: 'one', allowOnlyTriggers: true }}
                enabled={[TPlaceholderInputSuggestion.CallUser]}
              />
              <Form.Description className="text-xs">
                {t(
                  'pick-member-fallback-description',
                  'This member is picked instead. Empty skips the step, so later steps get no member.',
                )}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
      </AutomationConfigFormWrapper>
    </FormProvider>
  );
};
