import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, Select, ToggleGroup } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  AutomationActionFormProps,
  PlaceholderInput,
  TPlaceholderInputSuggestion,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
} from 'ui-modules';
import { VOUCHER_VALIDITY_UNITS } from '~/modules/loyalties/settings/voucher/utils/voucherTerm';
import { SelectVoucherCampaign } from '~/modules/loyalties/vouchers/components/selects/SelectVoucherCampaign';
import { useIssueVoucherActionForm } from '../../../hooks/useCampaignActionForm';
import {
  issueVoucherActionConfigFormSchema,
  TIssueVoucherActionConfigForm,
} from '../../../states/campaignActionConfigFormDefinitions';

export const IssueVoucherActionConfigForm = ({
  formRef,
  onSaveActionConfig,
  currentAction,
  targetType,
}: AutomationActionFormProps<TIssueVoucherActionConfigForm>) => {
  const { t } = useTranslation('loyalty');
  const { form, customValidity, setCustomValidity } = useIssueVoucherActionForm(
    {
      resolver: zodResolver(issueVoucherActionConfigFormSchema),
      currentConfig: currentAction?.config,
    },
  );

  const { control, handleSubmit } = form;

  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Issue voucher configuration',
  });

  useAutomationRemoteFormSubmit({
    formRef,
    callback: () => {
      handleSubmit(onSaveActionConfig, handleValidationErrors)();
    },
  });

  return (
    <Form {...form}>
      <div className="flex flex-col gap-5">
        <Form.Field
          control={control}
          name="attribution"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('recipient')}</Form.Label>
              <PlaceholderInput
                propertyType={targetType}
                value={field.value}
                onChange={field.onChange}
                placeholderConfig={{
                  selectMode: 'one',
                  allowOnlyTriggers: true,
                }}
                enabled={[
                  TPlaceholderInputSuggestion.CallUser,
                  TPlaceholderInputSuggestion.CallCompany,
                  TPlaceholderInputSuggestion.CallCustomer,
                ]}
              />
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={control}
          name="voucherCampaignId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('voucher-campaign')}</Form.Label>
              <SelectVoucherCampaign.FormItem
                value={field.value}
                onValueChange={field.onChange}
                placeholder={t('select-voucher-campaign')}
              />
              <Form.Message />
            </Form.Item>
          )}
        />

        <div className="flex flex-col gap-2">
          <Form.Label>{t('voucher-validity')}</Form.Label>
          <ToggleGroup
            type="single"
            variant="outline"
            className="w-fit"
            value={customValidity ? 'custom' : 'campaign'}
            onValueChange={(next) =>
              next && setCustomValidity(next === 'custom')
            }
          >
            <ToggleGroup.Item value="campaign" className="px-3">
              {t('voucher-validity-step.campaign')}
            </ToggleGroup.Item>
            <ToggleGroup.Item value="custom" className="px-3">
              {t('voucher-validity-step.custom')}
            </ToggleGroup.Item>
          </ToggleGroup>
          {customValidity && (
            <div className="grid grid-cols-2 gap-4">
              <Form.Field
                control={control}
                name="customRule.count"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Control>
                      <Input
                        type="number"
                        min={1}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={control}
                name="customRule.unit"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Control>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <Select.Trigger>
                          {t(`voucher-validity-unit.${field.value}`)}
                        </Select.Trigger>
                        <Select.Content>
                          {VOUCHER_VALIDITY_UNITS.map((unit) => (
                            <Select.Item key={unit} value={unit}>
                              {t(`voucher-validity-unit.${unit}`)}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
          )}
          <Form.Description>
            {t(
              customValidity
                ? 'voucher-validity-step-hint.custom'
                : 'voucher-validity-step-hint.campaign',
            )}
          </Form.Description>
        </div>
      </div>
    </Form>
  );
};
