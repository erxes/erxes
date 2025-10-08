import { UseFormReturn } from 'react-hook-form';
import { TChannelForm } from '../../types';
import { Form, IconPicker, Input, Textarea } from 'erxes-ui';
import { SelectMember } from 'ui-modules';

export const ChannelForm = ({
  form,
}: {
  form: UseFormReturn<TChannelForm>;
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="w-full flex gap-2">
        <Form.Field
          control={form.control}
          name="icon"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Icon</Form.Label>
              <Form.Description className="sr-only">Icon</Form.Description>
              <Form.Control>
                <IconPicker
                  onValueChange={field.onChange}
                  value={field.value}
                  className="w-min"
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="name"
          render={({ field }) => (
            <Form.Item className="flex-auto">
              <Form.Label>Name</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>

      <Form.Field
        control={form.control}
        name="description"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Description</Form.Label>
            <Form.Control>
              <Textarea {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="memberIds"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Members</Form.Label>
            <Form.Control>
              <SelectMember.FormItem
                mode="multiple"
                value={field.value}
                onValueChange={field.onChange}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
