import { AutomationConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';
import { Form, Input } from 'erxes-ui';
import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  PlaceholderInput,
  TAutomationActionProps,
  TPlaceholderInputSuggestion,
} from 'ui-modules';
import { useApprovalForm } from '../hooks/useApprovalForm';
import { TApprovalConfigForm } from '../states/approvalConfigForm';

export const ApprovalConfigForm = ({
  handleSave,
  currentAction,
}: TAutomationActionProps<TApprovalConfigForm>) => {
  const { t } = useTranslation('automations');
  const { form, propertyType } = useApprovalForm(currentAction);
  const { control, handleSubmit } = form;

  return (
    <FormProvider {...form}>
      <AutomationConfigFormWrapper onSave={handleSubmit(handleSave)}>
        <Form.Field
          control={control}
          name="approverIds"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('approval-approvers', 'Approvers')}</Form.Label>
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
                  'approval-approvers-description',
                  'The first decision wins. Asked in the name of the automation owner, who may approve too.',
                )}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="summary"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('approval-summary', 'What to approve')}</Form.Label>
              <PlaceholderInput
                propertyType={propertyType}
                value={field.value || ''}
                onChange={field.onChange}
                variant="expression"
              >
                <PlaceholderInput.Header />
              </PlaceholderInput>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="timeoutHours"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('approval-timeout', 'Wait for (hours)')}</Form.Label>
              <Form.Control>
                <Input
                  type="number"
                  min={1}
                  placeholder="72"
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              </Form.Control>
              <Form.Description className="text-xs">
                {t(
                  'approval-timeout-description',
                  'With no decision by then, the flow takes the Rejected branch as expired. 72 when empty.',
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
