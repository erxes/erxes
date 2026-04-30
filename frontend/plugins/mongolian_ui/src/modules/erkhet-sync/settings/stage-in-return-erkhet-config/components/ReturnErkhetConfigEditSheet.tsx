import { Button, Form, Input, Select, Sheet } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SelectBoard, SelectPipeline, SelectStage } from 'ui-modules';
import { addStageInReturnErkhetConfigSchema } from '../constants/addStageInReturnErkhetConfigSchema';
import { RETURN_TYPES } from '../constants/returnTypesData';
import { TReturnErkhetConfig } from '../types';
import { TReturnErkhetConfigRow } from '../hooks/useReturnErkhetConfigs';

interface Props {
  config: TReturnErkhetConfigRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, data: TReturnErkhetConfig) => Promise<void>;
  loading: boolean;
}

export const ReturnErkhetConfigEditSheet = ({
  config,
  open,
  onOpenChange,
  onSubmit,
  loading,
}: Props) => {
  const form = useForm<TReturnErkhetConfig>({
    resolver: zodResolver(addStageInReturnErkhetConfigSchema),
    defaultValues: {
      title: config.title,
      boardId: config.boardId,
      pipelineId: config.pipelineId,
      stageId: config.stageId,
      userEmail: config.userEmail ?? '',
      returnType: config.returnType,
    },
  });

  useEffect(() => {
    form.reset({
      title: config.title,
      boardId: config.boardId,
      pipelineId: config.pipelineId,
      stageId: config.stageId,
      userEmail: config.userEmail ?? '',
      returnType: config.returnType,
    });
  }, [config, form]);

  const selectedBoardId = form.watch('boardId');
  const selectedPipelineId = form.watch('pipelineId');

  const handleSubmit = async (data: TReturnErkhetConfig) => {
    await onSubmit(config._id, data);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal>
      <Sheet.View className="sm:max-w-2xl">
        <Sheet.Header>
          <Sheet.Title>Edit Return Erkhet Config</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="flex flex-col overflow-hidden p-0">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-4">
                    <Form.Field
                      name="title"
                      control={form.control}
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>Title</Form.Label>
                          <Form.Control>
                            <Input {...field} placeholder="Title" />
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                    <Form.Field
                      control={form.control}
                      name="pipelineId"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>Pipeline</Form.Label>
                          <SelectPipeline
                            mode="single"
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value as string);
                              form.setValue('stageId', '');
                            }}
                            boardId={selectedBoardId || undefined}
                            placeholder="Select pipeline"
                          />
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                    <Form.Field
                      name="userEmail"
                      control={form.control}
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>User Email</Form.Label>
                          <Form.Control>
                            <Input {...field} placeholder="User Email" />
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-4">
                    <Form.Field
                      control={form.control}
                      name="boardId"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>Board</Form.Label>
                          <SelectBoard
                            mode="single"
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value as string);
                              form.setValue('pipelineId', '');
                              form.setValue('stageId', '');
                            }}
                            placeholder="Select board"
                          />
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                    <Form.Field
                      control={form.control}
                      name="stageId"
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
                    <Form.Field
                      control={form.control}
                      name="returnType"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>Return Type</Form.Label>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <Select.Trigger className="w-full">
                              <Select.Value placeholder="Select return type" />
                            </Select.Trigger>
                            <Select.Content>
                              {RETURN_TYPES.map((type) => (
                                <Select.Item key={type.value} value={type.value}>
                                  {type.label}
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 p-5 border-t">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </Form>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
