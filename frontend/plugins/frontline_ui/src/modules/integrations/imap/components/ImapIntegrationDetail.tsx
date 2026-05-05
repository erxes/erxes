import { CellContext } from '@tanstack/react-table';
import { IIntegrationDetail } from '@/integrations/types/Integration';
import { Button, Dialog, Form, Separator, Spinner, toast } from 'erxes-ui';
import { IconEdit } from '@tabler/icons-react';
import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';
import { useIntegrationEdit } from '@/integrations/hooks/useIntegrationEdit';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { SelectBrand } from 'ui-modules';
import {
  IMAP_FORM_FIELDS,
  ImapFormField,
  ImapFormValues,
  imapFormSchema,
} from './ImapIntegrationForm';
import { ImapIntegrationFormLayout } from './ImapIntegrationFormLayout';

/* ── Page ────────────────────────────────────────────────────────────── */

export const ImapIntegrationDetail = () => <ImapIntegrationFormLayout />;

/* ── Table action ────────────────────────────────────────────────────── */

export const ImapIntegrationActions = ({
  cell,
}: {
  cell: CellContext<IIntegrationDetail, unknown>;
}) => <ImapIntegrationEditSheet id={cell.row.original._id} />;

/* ── Edit sheet ──────────────────────────────────────────────────────── */

export const ImapIntegrationEditSheet = ({ id }: { id: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <div className="flex items-center gap-2 w-full cursor-pointer">
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

/* ── Edit form ───────────────────────────────────────────────────────── */

export const ImapIntegrationEditForm = ({
  id,
  setOpen,
}: {
  id: string;
  setOpen: (open: boolean) => void;
}) => {
  const { loading, integrationDetail } = useIntegrationDetail({ integrationId: id });
  const { editIntegration, loading: editLoading } = useIntegrationEdit();

  const form = useForm<ImapFormValues>({
    resolver: zodResolver(imapFormSchema),
  });

  useEffect(() => {
    if (!integrationDetail) return;
    const d = integrationDetail.details?.data ?? {};
    form.reset({
      name: integrationDetail.name ?? '',
      host: d.host ?? '',
      smtpHost: d.smtpHost ?? '',
      smtpPort: d.smtpPort ?? '',
      mainUser: d.mainUser ?? '',
      user: d.user ?? '',
      password: d.password ?? '',
      brandId: integrationDetail.brandId ?? '',
    });
  }, [integrationDetail, form]);

  const onSubmit = (data: ImapFormValues) => {
    editIntegration({
      variables: {
        _id: id,
        name: data.name,
        channelId: integrationDetail?.channelId ?? '',
        brandId: data.brandId,
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
      onError: (err) => {
        toast({ title: err.message, variant: 'destructive' });
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
          onSubmit={form.handleSubmit(onSubmit)}
          className="p-6 flex-auto overflow-auto grid grid-cols-1 gap-3"
        >
          {IMAP_FORM_FIELDS.map((field) => (
            <ImapFormField key={field.name} {...field} control={form.control} />
          ))}

          <Form.Field
            name="brandId"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Brand</Form.Label>
                <Form.Control>
                  <SelectBrand
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select a brand"
                    className="w-full h-10 rounded-lg border bg-background"
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Separator />
          <Dialog.Footer className="flex justify-end gap-2 py-4">
            <Dialog.Close asChild>
              <Button variant="ghost" disabled={editLoading}>
                Close
              </Button>
            </Dialog.Close>
            <Button type="submit" disabled={editLoading}>
              {editLoading ? 'Saving…' : 'Save'}
            </Button>
          </Dialog.Footer>
        </form>
      </Form>
    </>
  );
};
