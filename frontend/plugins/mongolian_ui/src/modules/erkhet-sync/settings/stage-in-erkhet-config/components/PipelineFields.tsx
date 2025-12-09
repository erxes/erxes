// src/modules/erkhet-sync/settings/stage-in-erkhet-config/components/PipelineFields.tsx
import { Form } from 'erxes-ui';
import { SelectSalesBoard } from './selects/SelectBoard';
import { SelectPipeline } from './selects/SelectPipeline';
import { SelectStage } from './selects/SelectStage';
import { TFormControl } from '../types/form';

interface PipelineFieldsProps {
  control: TFormControl;
  selectedBoardId: string;
  selectedPipelineId: string;
  onBoardChange: (value: string) => void;
  onPipelineChange: (value: string) => void;
}

export const PipelineFields: React.FC<PipelineFieldsProps> = ({
  control,
  selectedBoardId,
  selectedPipelineId,
  onBoardChange,
  onPipelineChange,
}) => {
  return (
    <>
      <Form.Field
        control={control}
        name="boardId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Board</Form.Label>
            <SelectSalesBoard
              value={field.value}
              onValueChange={(value: string) => {
                field.onChange(value);
                onBoardChange(value);
              }}
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
            <SelectPipeline
              value={field.value}
              onValueChange={(value: string) => {
                field.onChange(value);
                onPipelineChange(value);
              }}
              boardId={selectedBoardId}
              disabled={!selectedBoardId}
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
            <SelectStage
              id="stageId"
              variant="form"
              value={field.value}
              onValueChange={field.onChange}
              pipelineId={selectedPipelineId}
              disabled={!selectedPipelineId}
            />
            <Form.Message />
          </Form.Item>
        )}
      />
    </>
  );
};
