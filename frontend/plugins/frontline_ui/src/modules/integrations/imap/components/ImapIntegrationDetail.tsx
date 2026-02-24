import { CellContext } from '@tanstack/react-table';
import { IIntegrationDetail } from '@/integrations/types/Integration';
import {
  Button,
  Dialog,
  Form,
  Input,
  toast,
  Spinner,
  Separator,
} from 'erxes-ui';
import { IconEdit } from '@tabler/icons-react';
import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';
import { useIntegrationEdit } from '@/integrations/hooks/useIntegrationEdit';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { imapFormSchema } from './ImapIntegrationForm';
import { ImapIntegrationFormLayout } from '@/integrations/imap/components/ImapIntegrationFormLayout';

export const ImapIntegrationDetail = () => {
  return <ImapIntegrationFormLayout />;
};

export const ImapIntegrationActions = ({
  cell,
}: {
  cell: CellContext<IIntegrationDetail, unknown>;
}) => {
  return <ImapIntegrationEditSheet id={cell.row.original._id} />;
};

export const ImapIntegrationEditSheet = ({ id }: { id: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <div className="flex items-center gap-2 w-full">
          <IconEdit size={16} />
          Edit
        </div>
      </Dialog.Trigger>
      <Dialog.Content className="p-0 gap-0 border-0 shadow-lg">
        <ImapIntegrationEditForm id={id} setOpen={setOpen} />
      </Dialog.Content>
    </Dialog>
  );
};

export const ImapIntegrationEditForm = ({
  id,
  setOpen,
}: {
  id: string;
  setOpen: (open: boolean) => void;
}) => {
  const { loading, integrationDetail } = useIntegrationDetail({
    integrationId: id,
  });

  const { editIntegration, loading: editLoading } = useIntegrationEdit();
  const form = useForm<z.infer<typeof imapFormSchema>>({
    resolver: zodResolver(imapFormSchema),
  });

  useEffect(() => {
    if (integrationDetail) {
      const details = integrationDetail.details.data || {};
      form.reset({
        name: integrationDetail.name || '',
        host: details.host || '',
        smtpHost: details.smtpHost || '',
        smtpPort: details.smtpPort || '',
        mainUser: details.mainUser || '',
        user: details.user || '',
        password: details.password || '',
      });
    }
  }, [integrationDetail, form]);

  const onSubmit = (data: z.infer<typeof imapFormSchema>) => {
    editIntegration({
      variables: {
        _id: id,
        name: data.name,
        channelId: integrationDetail?.channelId || '',
        details: {
          host: data.host,
          smtpHost: data.smtpHost,
          smtpPort: data.smtpPort,
          mainUser: data.mainUser,
          user: data.user,
          password: data.password,
        },
      },
      refetchQueries: ['Integrations', 'IntegrationDetail'],
      onCompleted: () => {
        setOpen(false);
        toast({ title: 'IMAP Integration updated' });
      },
      onError: (error) => {
        toast({ title: error.message, variant: 'destructive' });
      },
    });
  };

  if (loading) return <Spinner className="p-20" />;

  return (
    <>
      <Dialog.Header className="flex-row items-center justify-between space-y-0 px-4 py-3">
        <Dialog.Title>{integrationDetail?.name}</Dialog.Title>
        <Dialog.Close />
      </Dialog.Header>
      <Separator />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (error) => {
            console.log(error);
          })}
          className="p-6 flex-auto overflow-auto"
        >
          <Form.Field
            name="name"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Name</Form.Label>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            name="host"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>IMAP Host</Form.Label>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            name="smtpHost"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>SMTP Host</Form.Label>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            name="smtpPort"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>SMTP Port</Form.Label>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            name="mainUser"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Main User </Form.Label>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            name="user"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>User</Form.Label>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            name="password"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Password</Form.Label>
                <Form.Control>
                  <Input type="password" {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Separator />
          <Dialog.Footer className="flex justify-end py-4 px-6">
            <Dialog.Close asChild>
              <Button disabled={loading || editLoading} variant="ghost">
                Close
              </Button>
            </Dialog.Close>
            <Button type="submit" disabled={loading || editLoading}>
              Save
            </Button>
          </Dialog.Footer>
        </form>
      </Form>
    </>
  );
};
