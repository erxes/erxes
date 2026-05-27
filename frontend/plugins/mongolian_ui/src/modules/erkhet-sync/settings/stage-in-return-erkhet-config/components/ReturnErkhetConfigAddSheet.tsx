import { IconPlus } from '@tabler/icons-react';
import { Button, Form, Input, Select, Sheet } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addStageInReturnErkhetConfigSchema } from '../constants/addStageInReturnErkhetConfigSchema';
import { RETURN_TYPES } from '../constants/returnTypesData';
import { TReturnErkhetConfig } from '../types';
import { PipelineSelectorFields } from '../../shared/components/PipelineSelectorFields';

const defaultValues: TReturnErkhetConfig = {
  title: '',
  boardId: '',
  pipelineId: '',
  stageId: '',
  userEmail: '',
  returnType: '',
};

interface Props {
  onSubmit: (data: TReturnErkhetConfig) => Promise<void>;
  loading: boolean;
}

export const ReturnErkhetConfigAddSheet = ({ onSubmit, loading }: Props) => {
  const [open, setOpen] = useState(false);

  const form = useForm<TReturnErkhetConfig>({
    resolver: zodResolver(addStageInReturnErkhetConfigSchema),
    defaultValues,
  });

  const handleSubmit = async (data: TReturnErkhetConfig) => {
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
          <Sheet.Title>New Return Erkhet Config</Sheet.Title>
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
                  <div className="flex flex-col gap-4">
                    <PipelineSelectorFields form={form} />
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
