import { IconPlus } from '@tabler/icons-react';
import { Button, Form, Input, Sheet } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SelectBoard, SelectPipeline, SelectStage } from 'ui-modules';
import { addPipelineRemainderConfigSchema } from '../constants/addPipelineRemainderConfigSchema';
import { AddPipelineRemainderConfig } from '../types';

const defaultValues: AddPipelineRemainderConfig = {
  title: '',
  boardId: '',
  pipelineId: '',
  stageId: '',
  account: '',
  location: '',
};

interface Props {
  onSubmit: (data: AddPipelineRemainderConfig) => Promise<void>;
  loading: boolean;
}

export const PipelineRemainderConfigAddSheet = ({ onSubmit, loading }: Props) => {
  const [open, setOpen] = useState(false);

  const form = useForm<AddPipelineRemainderConfig>({
    resolver: zodResolver(addPipelineRemainderConfigSchema),
    defaultValues,
  });

  const selectedBoardId = form.watch('boardId');
  const selectedPipelineId = form.watch('pipelineId');

  const handleSubmit = async (data: AddPipelineRemainderConfig) => {
    await onSubmit(data);
    setOpen(false);
    form.reset();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen} modal>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          New Config
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="sm:max-w-2xl">
        <Sheet.Header>
          <Sheet.Title>New Pipeline Remainder Config</Sheet.Title>
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
                      name="account"
                      control={form.control}
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>Account</Form.Label>
                          <Form.Control>
                            <Input {...field} placeholder="Account" />
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
                      name="location"
                      control={form.control}
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>Location</Form.Label>
                          <Form.Control>
                            <Input {...field} placeholder="Location" />
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 p-5 border-t">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
