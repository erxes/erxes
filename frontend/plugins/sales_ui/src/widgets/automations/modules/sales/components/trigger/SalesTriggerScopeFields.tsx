import { SelectBoard, SelectPipeline, SelectStage } from 'ui-modules';
import { Form } from 'erxes-ui';
import { ReactNode } from 'react';
import { Control } from 'react-hook-form';
import { TStageProbalityTriggerConfigForm } from '../../states/stageProbalityTriggerConfigFormDefinitions';

type SalesTriggerScopeFieldsProps = {
  control: Control<TStageProbalityTriggerConfigForm>;
  boardId?: string;
  pipelineId?: string;
  optional?: boolean;
  children: ReactNode;
};

export const SalesTriggerScopeFields = ({
  control,
  boardId,
  pipelineId,
  children,
  optional = true,
}: SalesTriggerScopeFieldsProps) => {
  return (
    <>
      <div className="flex flex-row items-center gap-2 mt-2">
        <Form.Field
          control={control}
          name="boardId"
          render={({ field }) => (
            <Form.Item className="flex-1">
              <Form.Label>Board {optional && '(optional)'}</Form.Label>
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
            <Form.Item className="flex-1">
              <Form.Label>Pipeline {optional && '(optional)'}</Form.Label>
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
      </div>
      {children}
    </>
  );
};

type SalesTriggerStageFieldProps = {
  control: Control<TStageProbalityTriggerConfigForm>;
  name: 'stageId' | 'fromStageId' | 'toStageId';
  label: string;
  pipelineId?: string;
};

export const SalesTriggerStageField = ({
  control,
  name,
  label,
  pipelineId,
}: SalesTriggerStageFieldProps) => {
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{label}</Form.Label>
          <SelectStage.FormItem
            mode="single"
            onValueChange={field.onChange}
            value={field.value}
            pipelineId={pipelineId}
          />
        </Form.Item>
      )}
    />
  );
};
