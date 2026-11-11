/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from '@storybook/react';
import { Form } from 'erxes-ui/components/form';
import { Input } from 'erxes-ui/components/input';
import { Button } from 'erxes-ui/components/button';
import { Checkbox } from 'erxes-ui/components/checkbox';
import { Select } from 'erxes-ui/components/select';
import { Textarea } from 'erxes-ui/components/textarea';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const meta: Meta<typeof Form> = {
  title: 'Components/Form',
  component: Form,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Form>;

const formSchema = z.object({
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  bio: z.string().optional(),
  notifications: z.boolean().default(false),
  role: z.string({
    required_error: 'Please select a role.',
  }),
});

export const Default: Story = {
  render: () => {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        username: '',
        email: '',
        bio: '',
        notifications: false,
        role: '',
      },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
      alert(JSON.stringify(values, null, 2));
    };

    return (
      <div className="w-96 p-6 bg-white rounded-lg shadow-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <Form.Field
                name="username"
                control={form.control}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Username</Form.Label>
                    <Form.Control>
                      <Input placeholder="Enter your username" {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                name="email"
                control={form.control}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Email</Form.Label>
                    <Form.Control>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                name="bio"
                control={form.control}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Bio</Form.Label>
                    <Form.Control>
                      <Textarea
                        placeholder="Tell us about yourself"
                        {...field}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                name="role"
                control={form.control}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Role</Form.Label>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <Form.Control>
                        <Select.Trigger>
                          <Select.Value placeholder="Select a role" />
                        </Select.Trigger>
                      </Form.Control>
                      <Select.Content>
                        <Select.Item value="admin">Admin</Select.Item>
                        <Select.Item value="user">User</Select.Item>
                        <Select.Item value="guest">Guest</Select.Item>
                      </Select.Content>
                    </Select>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                name="notifications"
                control={form.control}
                render={({ field }) => (
                  <Form.Item>
                    <div className="flex items-center gap-2 py-2">
                      <Form.Control>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </Form.Control>
                      <Form.Label variant="peer">
                        Receive notifications
                      </Form.Label>
                    </div>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Button type="submit" className="w-full">
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  },
};
