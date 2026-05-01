import { Form } from 'erxes-ui';
import { UseFormReturn, FieldValues, Path } from 'react-hook-form';
import { SelectBoard, SelectPipeline, SelectStage } from 'ui-modules';

interface Props<T extends FieldValues & { boardId: string; pipelineId: string; stageId: string }> {
  form: UseFormReturn<T>;
}

export const PipelineSelectorFields = <
  T extends FieldValues & { boardId: string; pipelineId: string; stageId: string },
>({
  form,
}: Props<T>) => {
  const selectedBoardId = form.watch('boardId' as Path<T>) as string;
  const selectedPipelineId = form.watch('pipelineId' as Path<T>) as string;

  return (
    <>
      <Form.Field
        control={form.control}
        name={'boardId' as Path<T>}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Board</Form.Label>
            <SelectBoard
              mode="single"
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value as string);
                form.setValue('pipelineId' as Path<T>, '' as any);
                form.setValue('stageId' as Path<T>, '' as any);
              }}
              placeholder="Select board"
            />
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name={'pipelineId' as Path<T>}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Pipeline</Form.Label>
            <SelectPipeline
              mode="single"
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value as string);
                form.setValue('stageId' as Path<T>, '' as any);
              }}
              boardId={selectedBoardId || undefined}
              placeholder="Select pipeline"
            />
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name={'stageId' as Path<T>}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Stage</Form.Label>
            <SelectStage
              mode="single"
              value={field.value}
              onValueChange={(value) => field.onChange(value as string)}
              pipelineId={selectedPipelineId || undefined}
              placeholder="Select stage"
            />
            <Form.Message />
          </Form.Item>
        )}
      />
    </>
  );
};
