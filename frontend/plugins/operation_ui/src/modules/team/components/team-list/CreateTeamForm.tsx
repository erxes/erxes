import { Form, Input, IconPicker, Textarea } from 'erxes-ui';
import { SelectMember } from 'ui-modules';
import { UseFormReturn } from 'react-hook-form';

import { TTeamForm } from '@/team/types';

export const CreateTeamForm = ({
  form,
}: {
  form: UseFormReturn<TTeamForm>;
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
              <Form.Label>Team name</Form.Label>
              <Form.Description className="sr-only">Team Name</Form.Description>
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
            <Form.Label>description</Form.Label>
            <Form.Description className="sr-only">description</Form.Description>
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
            <Form.Description className="sr-only">Members</Form.Description>
            <Form.Control>
              <SelectMember.FormItem
                value={field.value}
                onValueChange={field.onChange}
                mode="multiple"
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
