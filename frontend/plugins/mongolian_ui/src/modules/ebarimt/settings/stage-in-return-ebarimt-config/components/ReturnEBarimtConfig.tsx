import { Button, Form, Input, Select } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { FILE_SYSTEM_TYPES } from '../constants/ebarimtData';
import { IconTrash } from '@tabler/icons-react';

const DEFAULT_VALUES = {
  title: '',
  destinationStageBoard: '',
  pipeline: '',
  stage: '',
};

export const ReturnEBarimtConfigForm = () => {
  const form = useForm({
    defaultValues: DEFAULT_VALUES,
  });

  return (
    <Form {...form}>
      <form className="h-full w-full mx-auto max-w-2xl px-9 py-5 flex flex-col gap-8">
        <h1 className="text-lg font-semibold">Return Ebarimt configs</h1>
        <Form.Field
          name="title"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label className="font-sans normal-case text-foreground text-sm font-medium leading-none">
                Title
              </Form.Label>
              <Form.Message />
              <Form.Control>
                <Input
                  type="text"
                  placeholder="Enter company name"
                  className="h-8"
                  {...field}
                />
              </Form.Control>
            </Form.Item>
          )}
        />

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-4">
            <Form.Field
              control={form.control}
              name="destinationStageBoard"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Destination Stage Board</Form.Label>
                  <Form.Control>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <Select.Trigger>
                        <Select.Value placeholder={'-'} />
                      </Select.Trigger>
                      <Select.Content>
                        {FILE_SYSTEM_TYPES.map((type) => (
                          <Select.Item key={type.value} value={type.value}>
                            {type.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="pipeline"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Pipeline</Form.Label>
                  <Form.Control>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <Select.Trigger>
                        <Select.Value placeholder={'-'} />
                      </Select.Trigger>
                      <Select.Content>
                        {FILE_SYSTEM_TYPES.map((type) => (
                          <Select.Item key={type.value} value={type.value}>
                            {type.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
          <div className="space-y-4">
            <Form.Field
              control={form.control}
              name="stage"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Stage</Form.Label>
                  <Form.Control>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <Select.Trigger>
                        <Select.Value placeholder={'-'} />
                      </Select.Trigger>
                      <Select.Content>
                        {FILE_SYSTEM_TYPES.map((type) => (
                          <Select.Item key={type.value} value={type.value}>
                            {type.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
        </div>

        <div className="text-right flex items-center justify-end gap-2">
          <Button variant="ghost" className="justify-self-end">
            <IconTrash className="size-4 text-destructive" />
            Delete
          </Button>
          <Button className="justify-self-end flex-none" type="submit">
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
};
