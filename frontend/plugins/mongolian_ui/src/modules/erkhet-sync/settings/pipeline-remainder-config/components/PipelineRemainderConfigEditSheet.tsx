import { Button, Form, Input, Sheet } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addPipelineRemainderConfigSchema } from '../constants/addPipelineRemainderConfigSchema';
import { AddPipelineRemainderConfig } from '../types';
import { TRemainderConfigRow } from '../hooks/usePipelineRemainderConfigs';
import { PipelineSelectorFields } from '../../shared/components/PipelineSelectorFields';

interface Props {
  config: TRemainderConfigRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, data: AddPipelineRemainderConfig) => Promise<void>;
  loading: boolean;
}

export const PipelineRemainderConfigEditSheet = ({
  config,
  open,
  onOpenChange,
  onSubmit,
  loading,
}: Props) => {
  const form = useForm<AddPipelineRemainderConfig>({
    resolver: zodResolver(addPipelineRemainderConfigSchema),
    defaultValues: {
      title: config.title,
      boardId: config.boardId,
      pipelineId: config.pipelineId,
      stageId: config.stageId,
      account: config.account,
      location: config.location,
    },
  });

  useEffect(() => {
    form.reset({
      title: config.title,
      boardId: config.boardId,
      pipelineId: config.pipelineId,
      stageId: config.stageId,
      account: config.account,
      location: config.location,
    });
  }, [config, form]);

  const handleSubmit = async (data: AddPipelineRemainderConfig) => {
    await onSubmit(config._id, data);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal>
      <Sheet.View className="sm:max-w-2xl">
        <Sheet.Header>
          <Sheet.Title>Edit Pipeline Remainder Config</Sheet.Title>
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
                  <div className="flex flex-col gap-4">
                    <PipelineSelectorFields form={form} />
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
