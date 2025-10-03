import { useCallback } from 'react';
import { SubmitHandler } from 'react-hook-form';

import { Button, Checkbox, Form, Input, Select } from 'erxes-ui';

import { useCreateOwner } from '@/organization/owner/hooks/useCreateOwner';
import {
  CreateOwnerFormType,
  PURPOSE_OPTIONS,
  useCreateOwnerForm,
} from '@/organization/owner/hooks/useCreateOwnerForm';

export const CreateOwner = () => {
  const { form } = useCreateOwnerForm();
  const { createOwner } = useCreateOwner();

  const submitHandler: SubmitHandler<CreateOwnerFormType> = useCallback(
    async (data) => {
      createOwner(data);
    },
    [createOwner],
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submitHandler)}
        className="mx-auto grid w-[350px] gap-5"
      >
        <Form.Field
          name="email"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <Input type="email" placeholder="Enter email" {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          name="firstName"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <Input type="text" placeholder="Enter first name" {...field} />
              </Form.Control>
            </Form.Item>
          )}
        />

        <Form.Field
          name="lastName"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <Input type="text" placeholder="Enter last name" {...field} />
              </Form.Control>
            </Form.Item>
          )}
        />

        <Form.Field
          name="password"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <Input
                  type="password"
                  placeholder="Enter password"
                  {...field}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          name="confirmPassword"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <Input
                  type="password"
                  placeholder="Confirm password"
                  {...field}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          name="purpose"
          control={form.control}
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <Select.Trigger
                    className={!field.value ? 'text-muted-foreground' : ''}
                  >
                    {field.value || 'Select purpose'}
                  </Select.Trigger>
                  <Select.Content>
                    {PURPOSE_OPTIONS.map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        {option.label}
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
          name="subscribeEmail"
          control={form.control}
          render={({ field }) => (
            <Form.Item className="flex flex-row items-start space-x-3 space-y-0">
              <Form.Control>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Form.Control>
              <div className="space-y-1 leading-none">
                <Form.Label>Subscribe to email updates</Form.Label>
              </div>
            </Form.Item>
          )}
        />

        <Button type="submit">Create Owner</Button>
      </form>
    </Form>
  );
};
