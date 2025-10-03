import { Form, Input, Textarea } from 'erxes-ui';
import { Control } from 'react-hook-form';
import { SelectMember } from 'ui-modules';
import { type TChannelForm } from '@/settings/types/channel';

type TProp = {
  control: Control<TChannelForm, any, TChannelForm>;
};

export const ChannelForm = ({ control }: TProp) => {
  return (
    <div className="flex flex-col gap-3">
      <Form.Field
        control={control}
        name="name"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>name</Form.Label>
            <Form.Description className="sr-only">
              Channel name
            </Form.Description>
            <Form.Control>
              <Input {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="description"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>description</Form.Label>
            <Form.Description className="sr-only">
              Channel description
            </Form.Description>
            <Form.Control>
              <Textarea {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="memberIds"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>users</Form.Label>
            <Form.Description className="sr-only">
              Channel users
            </Form.Description>
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
