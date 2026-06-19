import {
  AutomationTriggerFormProps,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
} from 'ui-modules';
import { Form, Select } from 'erxes-ui';
import {
  TStageProbalityTriggerConfigForm,
  stageProbalityTriggerConfigFormSchema,
} from '../../states/stageProbalityTriggerConfigFormDefinitions';
import { useForm, useWatch } from 'react-hook-form';
import { STAGE_PROBABILITIES } from '../../constants/configForm';
import {
  SalesTriggerScopeFields,
  SalesTriggerStageField,
} from './SalesTriggerScopeFields';
import { zodResolver } from '@hookform/resolvers/zod';

export const StageProbabilityTriggerConfigForm = ({
  formRef,
  onSaveTriggerConfig,
  activeTrigger,
}: AutomationTriggerFormProps<TStageProbalityTriggerConfigForm>) => {
  const form = useForm<TStageProbalityTriggerConfigForm>({
    resolver: zodResolver(stageProbalityTriggerConfigFormSchema),
    defaultValues: {
      ...(activeTrigger?.config || {}),
    },
  });
  const { control, handleSubmit } = form;
  const [boardId, pipelineId] = useWatch({
    control,
    name: ['boardId', 'pipelineId'],
  });
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Stage Probability Trigger Configuration',
  });

  useAutomationRemoteFormSubmit({
    formRef,
    callback: () => {
      handleSubmit(onSaveTriggerConfig, handleValidationErrors)();
    },
  });

  return (
    <Form {...form}>
      <Form.Field
        control={control}
        name="probability"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Probability</Form.Label>
            <Select value={field.value} onValueChange={field.onChange}>
              <Select.Trigger>
                <Select.Value placeholder="Select probability" />
              </Select.Trigger>
              <Select.Content>
                {STAGE_PROBABILITIES.map((probability) => (
                  <Select.Item key={probability} value={probability}>
                    {probability}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Form.Message />
          </Form.Item>
        )}
      />
      <SalesTriggerScopeFields
        control={control}
        boardId={boardId}
        pipelineId={pipelineId}
      >
        <SalesTriggerStageField
          control={control}
          name="stageId"
          label="Stage (optional)"
          pipelineId={pipelineId}
        />
      </SalesTriggerScopeFields>
    </Form>
  );
};
