import {
  AutomationActionFormProps,
  PlaceholderInput,
  SelectBoard,
  SelectPipeline,
  SelectStage,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
  TPlaceholderInputSuggestion,
} from 'ui-modules';
import {
  TSalesActionConfigForm,
  salesActionConfigFormSchema,
} from '../../states/salesActionConfigFormDefinitions';
import { TChecklistActionConfigForm } from '../../states/checklistActionConfigFormDefinitions';
import { useForm, useWatch } from 'react-hook-form';

import { Form } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PipelineLabelsCommandList } from '../PipelineLabelsCommandList';
import { zodResolver } from '@hookform/resolvers/zod';

type TSalesAutomationActionConfigForm =
  | TSalesActionConfigForm
  | TChecklistActionConfigForm;

export const CreateDealActionConfigForm = ({
  formRef,
  onSaveActionConfig,
  currentAction,
  targetType,
}: AutomationActionFormProps<TSalesAutomationActionConfigForm>) => {
  const { t } = useTranslation('sales');
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
      {/* <div className="w-2xl"> */}
      <div className="grid grid-cols-3 gap-2">
        <Form.Field
          control={control}
          name="boardId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('board')}</Form.Label>
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
              <Form.Label>{t('pipeline')}</Form.Label>
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
              <Form.Label>{t('stage')}</Form.Label>
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
            <Form.Label>{t('name')}</Form.Label>
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
            <Form.Label>{t('description')}</Form.Label>
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
            <Form.Label>{t('assigned-to')}</Form.Label>
            <PlaceholderInput
              propertyType={targetType}
              value={field.value}
              onChange={field.onChange}
              placeholderConfig={{
                selectMode: 'one',
                allowOnlyTriggers: true,
              }}
              enabled={[TPlaceholderInputSuggestion.CallUser]}
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
            <Form.Label>{t('close-date')}</Form.Label>
            <PlaceholderInput
              propertyType={targetType}
              value={field.value}
              onChange={field.onChange}
              placeholderConfig={{
                selectMode: 'one',
                allowOnlyTriggers: true,
              }}
              enabled={[TPlaceholderInputSuggestion.Date]}
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
            <Form.Label>{t('label-ids')}</Form.Label>
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
                  title: t('pipeline-labels'),
                  mode: 'command',
                  render: (props) => (
                    <PipelineLabelsCommandList
                      {...props}
                      pipelineId={pipelineId}
                    />
                  ),
                },
              ]}
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
            <Form.Label>{t('priority')}</Form.Label>
            <PlaceholderInput
              propertyType={targetType}
              value={field.value}
              onChange={field.onChange}
              selectionType={TPlaceholderInputSuggestion.Option}
              popoverPosition="left"
              placeholderConfig={{
                selectMode: 'one',
                allowOnlyTriggers: true,
              }}
              enabled={[TPlaceholderInputSuggestion.Option]}
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
      {/* </div> */}
    </Form>
  );
};
