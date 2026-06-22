import {
  AutomationActionFormProps,
  PlaceholderInput,
  TPlaceholderInputSuggestion,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
} from 'ui-modules';
import {
  TAdjustScoreActionConfigForm,
  adjustScoreActionConfigFormSchema,
} from '../../../states/adjustScoreActionConfigFormDefinitions';
import { Form, ToggleGroup } from 'erxes-ui';
import { IconMinus, IconPlus } from '@tabler/icons-react';
// import { SelectScoreCampaign } from '@/loyalties/score/components/selects/SelectScoreCampaign';
import { SCORE_ACTION_OPTIONS } from '../../../constants/adjustScoreAction';
import { useAdjustScoreActionForm } from '../../../hooks/useAdjustScoreActionForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { SelectScoreCampaign } from '~/modules/loyalties/scores/components/selects/SelectScoreCampaign';

export const AdjustScoreCampaignActionConfigForm = ({
  formRef,
  onSaveActionConfig,
  currentAction,
  targetType,
}: AutomationActionFormProps<TAdjustScoreActionConfigForm>) => {
  const form = useAdjustScoreActionForm({
    resolver: zodResolver(adjustScoreActionConfigFormSchema),
    currentConfig: currentAction?.config,
  });

  const { control, handleSubmit } = form;

  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Adjust score configuration',
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
              <Form.Label>Recipient</Form.Label>
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
          name="campaignId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Score campaign</Form.Label>
              <SelectScoreCampaign.FormItem
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Select score campaign"
              />
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={control}
          name="action"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Score change</Form.Label>
              <Form.Control>
                <ToggleGroup
                  type="single"
                  value={field.value}
                  onValueChange={(value) => value && field.onChange(value)}
                  className="grid grid-cols-2 gap-2"
                >
                  {SCORE_ACTION_OPTIONS.map((option) => {
                    const Icon = option.value === 'add' ? IconPlus : IconMinus;

                    return (
                      <ToggleGroup.Item
                        key={option.value}
                        value={option.value}
                        className="h-9 justify-center gap-2"
                      >
                        <Icon className="size-4" />
                        <span>{option.label}</span>
                      </ToggleGroup.Item>
                    );
                  })}
                </ToggleGroup>
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
    </Form>
  );
};
