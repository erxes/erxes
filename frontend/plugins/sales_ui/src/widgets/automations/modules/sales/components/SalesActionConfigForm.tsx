import { SelectBoard } from '~/modules/deals/boards/components/SelectBoards';
import {
  salesActionConfigFormSchema,
  TSalesActionConfigForm,
} from '../states/salesActionConfigFormDefinitions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, toast } from 'erxes-ui';
import { SelectPipeline } from '~/modules/deals/pipelines/components/SelectPipelines';
import { SelectStage } from '~/modules/deals/stage/components/SelectStages';
import { useAutomationRemoteActionFormSubmit } from 'ui-modules/modules/automations/hooks/useAutomationRemoteActionFormSubmit';
import {
  AutomationActionFormProps,
  PlaceholderInput,
} from 'ui-modules/modules';
import { PipelineLabelsCommandList } from './PipelineLabelsCommandList';

export const SalesActionConfigForm = ({
  formRef,
  onSaveActionConfig,
  currentAction,
  targetType,
}: AutomationActionFormProps<TSalesActionConfigForm>) => {
  const form = useForm<TSalesActionConfigForm>({
    resolver: zodResolver(salesActionConfigFormSchema),
    defaultValues: {
      boardId: currentAction?.config?.boardId || '',
      pipelineId: currentAction?.config?.pipelineId || '',
      stageId: currentAction?.config?.stageId || '',
    },
  });
  const { control, getValues, handleSubmit } = form;
  const { boardId, pipelineId } = getValues();

  useAutomationRemoteActionFormSubmit({
    formRef,
    callback: () =>
      handleSubmit(onSaveActionConfig, () =>
        toast({
          title: 'There is some error in the form',
          variant: 'destructive',
        }),
      )(),
  });

  return (
    <Form {...form}>
      <div className="w-2xl">
        <Form.Field
          control={control}
          name="boardId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Board</Form.Label>
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
              <Form.Label>Pipeline</Form.Label>
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
              <Form.Label>Stage</Form.Label>
              <SelectStage.FormItem
                mode="single"
                onValueChange={field.onChange}
                value={field.value}
                pipelineId={pipelineId}
              />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="name"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Name</Form.Label>
              <PlaceholderInput
                propertyType={targetType}
                value={field.value}
                onChange={field.onChange}
              />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="description"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Description</Form.Label>
              <PlaceholderInput
                propertyType={targetType}
                value={field.value}
                onChange={field.onChange}
                variant="expression"
              >
                <PlaceholderInput.Header />
              </PlaceholderInput>
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="assignedTo"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Assigned To</Form.Label>
              <PlaceholderInput
                propertyType={targetType}
                value={field.value}
                onChange={field.onChange}
                enabled={{
                  attribute: true,
                  call_user: true,
                }}
              />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="closeDate"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Close Date</Form.Label>
              <PlaceholderInput
                propertyType={targetType}
                value={field.value}
                onChange={field.onChange}
                enabled={{
                  date: true,
                }}
              />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="labelIds"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Label IDs</Form.Label>
              <PlaceholderInput
                propertyType={targetType}
                value={field.value}
                onChange={field.onChange}
                extraSuggestionConfigs={[
                  {
                    type: 'pipeline_labels',
                    trigger: ';',
                    title: 'Pipeline Labels',
                    renderer: 'command',
                    formatSelection: (value) => value,
                  },
                ]}
                enabled={{
                  pipeline_labels: true,
                  attribute: true,
                }}
                customRenderers={{
                  pipeline_labels: (props) => (
                    <PipelineLabelsCommandList
                      {...props}
                      pipelineId={pipelineId}
                    />
                  ),
                }}
              />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="priority"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Priority</Form.Label>
              <PlaceholderInput
                propertyType={targetType}
                value={field.value}
                onChange={field.onChange}
                selectionMode="single"
                enabled={{
                  option: {
                    enabled: true,
                    options: ['Critical', 'High', 'Medium', 'Low'].map((p) => ({
                      label: p,
                      value: p,
                    })),
                  },
                }}
              />
            </Form.Item>
          )}
        />
      </div>
    </Form>
  );
};
