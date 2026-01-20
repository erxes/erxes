import { AutomationActionFormProps, PlaceholderInput } from 'ui-modules';
import { Form, toast } from 'erxes-ui';
import {
  TSalesActionConfigForm,
  salesActionConfigFormSchema,
} from '../../states/salesActionConfigFormDefinitions';
import {
  splitAutomationNodeType,
  useAutomationRemoteFormSubmit,
} from 'ui-modules';
import { useForm, useWatch } from 'react-hook-form';

import { PipelineLabelsCommandList } from '../PipelineLabelsCommandList';
import { SelectBoard } from '~/modules/deals/boards/components/common/SelectBoards';
import { SelectPipeline } from '~/modules/deals/pipelines/components/SelectPipelines';
import { SelectStage } from '~/modules/deals/stage/components/SelectStages';
import { useFormValidationErrorHandler } from 'ui-modules';
import { zodResolver } from '@hookform/resolvers/zod';

export const CreateDealActionConfigForm = ({
  formRef,
  onSaveActionConfig,
  currentAction,
  targetType,
  type,
}: AutomationActionFormProps<TSalesActionConfigForm>) => {
  const [, , collectionType] = splitAutomationNodeType(type);
  console.log({ collectionType });
  const form = useForm<TSalesActionConfigForm>({
    resolver: zodResolver(salesActionConfigFormSchema),
    defaultValues: {
      ...(currentAction?.config || {}),
    },
  });
  const { control, handleSubmit } = form;
  const [boardId, pipelineId] = useWatch({
    control,
    name: ['boardId', 'pipelineId'],
  });

  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Sales Action Configuration',
  });

  useAutomationRemoteFormSubmit({
    formRef,
    callback: () => {
      handleSubmit(onSaveActionConfig, handleValidationErrors)();
    },
  });

  return (
    <Form {...form}>
      <div className="w-2xl">
        <div className="grid grid-cols-3 gap-2">
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
        </div>
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
              <Form.Message />
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
              <Form.Message />
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
                placeholderConfig={{
                  selectMode: 'one',
                  allowOnlyTriggers: true,
                }}
                enabled={{
                  attribute: true,
                  call_user: true,
                }}
              />
              <Form.Message />
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
                placeholderConfig={{
                  selectMode: 'one',
                  allowOnlyTriggers: true,
                }}
                enabled={{
                  date: true,
                }}
              />
              <Form.Message />
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
                placeholderConfig={{
                  selectMode: 'many',
                  delimiter: ',',
                  wrap: (text) => `[${text}]`,
                  allowOnlyTriggers: true,
                }}
                extraSuggestionConfigs={[
                  {
                    type: 'pipeline_labels',
                    trigger: ';',
                    title: 'Pipeline Labels',
                    mode: 'command',
                    render: (props) => (
                      <PipelineLabelsCommandList
                        {...props}
                        pipelineId={pipelineId}
                      />
                    ),
                  },
                ]}
                enabled={{
                  attribute: true,
                }}
              />
              <Form.Message />
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
                selectionType="option"
                popoverPosition="left"
                placeholderConfig={{
                  selectMode: 'one',
                  allowOnlyTriggers: true,
                }}
                enabled={{
                  option: true,
                }}
                suggestionsOptions={{
                  option: {
                    options: ['Critical', 'High', 'Medium', 'Low'].map((p) => ({
                      label: p,
                      value: p,
                    })),
                  },
                }}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
    </Form>
  );
};
