import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Select, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FormSheet } from '~/components/FormSheet';
import { api, messageOf } from '~/lib/api';
import { USERS_KEY } from './useTeamMembers';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  fullName: z.string().trim().max(200),
  role: z.enum(['member', 'admin']),
});

type Values = z.infer<typeof schema>;

/** "Invite" in the settings header (owners and admins). */
export const InviteTeamMember = () => {
  const [open, setOpen] = useState(false);
  const client = useQueryClient();
  const { toast } = useToast();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', fullName: '', role: 'member' },
  });
  const invite = useMutation({
    mutationFn: (values: Values) =>
      api.users.invite({ ...values, fullName: values.fullName || undefined }),
    onSuccess: (user) => {
      void client.invalidateQueries({ queryKey: [...USERS_KEY, 'list'] });
      toast({ variant: 'success', title: `Invited ${user.email}` });
      form.reset();
      setOpen(false);
    },
    onError: (error) => toast({ variant: 'destructive', title: 'Could not invite', description: messageOf(error) }),
  });

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <IconPlus />
        Invite team members
      </Button>
      <FormSheet
        open={open}
        onOpenChange={setOpen}
        title="Invite team member"
        description="They can sign in once they accept the invitation."
        submitLabel="Invite"
        submitting={invite.isPending}
        onSubmit={form.handleSubmit((values) => invite.mutate(values))}
      >
        <Form {...form}>
          <Form.Field
            name="email"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Email</Form.Label>
                <Form.Control>
                  <Input {...field} type="email" autoFocus />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            name="fullName"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Full name</Form.Label>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            name="role"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Role</Form.Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Form.Control>
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                  </Form.Control>
                  <Select.Content>
                    <Select.Item value="member">Member</Select.Item>
                    <Select.Item value="admin">Admin</Select.Item>
                  </Select.Content>
                </Select>
                <Form.Message />
              </Form.Item>
            )}
          />
        </Form>
      </FormSheet>
    </>
  );
};
