import {
  AutomationTriggerFormProps,
  SelectBoard,
  SelectPipeline,
  SelectStage,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
} from 'ui-modules';
import { Form, Select } from 'erxes-ui';
import {
  TStageProbalityTriggerConfigForm,
  stageProbalityTriggerConfigFormSchema,
} from '~/widgets/automations/modules/sales/states/stageProbalityTriggerConfigFormDefinitions';
import { useForm, useWatch } from 'react-hook-form';

import { STAGE_PROBABILITIES } from '~/widgets/automations/modules/sales/constants/configForm';
import { zodResolver } from '@hookform/resolvers/zod';

export const StageProbalityTriggerConfigForm = ({
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
      <div className="grid grid-cols-3 gap-2 mt-2">
        <Form.Field
          control={control}
          name="boardId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Board (optional)</Form.Label>
              <SelectBoard.FormItem
                mode="single"
                onValueChange={field.onChange}
                value={field.value}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="pipelineId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Pipeline (optional)</Form.Label>
              <SelectPipeline.FormItem
                mode="single"
                onValueChange={field.onChange}
                value={field.value}
                boardId={boardId}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="stageId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Stage (optional)</Form.Label>
              <SelectStage.FormItem
                mode="single"
                onValueChange={field.onChange}
                value={field.value}
                pipelineId={pipelineId}
              />
            </Form.Item>
          )}
        />
      </div>
    </Form>
  );
};
