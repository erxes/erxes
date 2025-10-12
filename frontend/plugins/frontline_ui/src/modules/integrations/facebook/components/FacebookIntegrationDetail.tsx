import { Cell } from '@tanstack/table-core';
import { FacebookIntegrationFormSheet } from './FacebookIntegrationForm';
import { IIntegrationDetail } from '@/integrations/types/Integration';
import {
  Button,
  Dialog,
  Separator,
  Sheet,
  Spinner,
  Form,
  Input,
  toast,
} from 'erxes-ui';
import { IconEdit } from '@tabler/icons-react';
import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { SelectBrand } from 'ui-modules';
import { SelectChannel } from '@/inbox/channel/components/SelectChannel';
import { useIntegrationEdit } from '@/integrations/hooks/useIntegrationEdit';
import { FACEBOOK_INTEGRATION_SCHEMA } from '@/integrations/facebook/constants/FbMessengerSchema';

export const FacebookIntegrationDetail = ({ isPost }: { isPost?: boolean }) => {
  return (
    <div>
      <FacebookIntegrationFormSheet isPost={isPost} />
    </div>
  );
};

export const FacebookIntegrationActions = ({
  cell,
}: {
  cell: Cell<IIntegrationDetail, unknown>;
}) => {
  return <FacebookIntegrationEditSheet id={cell.row.original._id} />;
};

export const FacebookIntegrationEditSheet = ({ id }: { id: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline" size="icon">
          <IconEdit />
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="p-0 gap-0 border-0 shadow-lg">
        <FacebookIntegrationEditForm id={id} setOpen={setOpen} />
      </Dialog.Content>
    </Dialog>
  );
};

export const FacebookIntegrationEditForm = ({
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
  const form = useForm<z.infer<typeof FACEBOOK_INTEGRATION_SCHEMA>>({
    resolver: zodResolver(FACEBOOK_INTEGRATION_SCHEMA),
  });

  useEffect(() => {
    if (integrationDetail) {
      form.reset(integrationDetail);
    }
  }, [integrationDetail, form]);

  const onSubmit = (data: z.infer<typeof FACEBOOK_INTEGRATION_SCHEMA>) => {
    editIntegration({
      variables: {
        _id: id,
        ...data,
      },
      onCompleted: () => {
        setOpen(false);
        toast({ title: 'Integration updated' });
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
        <Sheet.Close />
      </Dialog.Header>
      <Separator />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (error) => {
            console.log(error);
          })}
        >
          <div className="p-6 pb-8 space-y-6">
            <Form.Field
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Name</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                </Form.Item>
              )}
            />
            <Form.Field
              name="brandId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Brand</Form.Label>
                  <SelectBrand.FormItem
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              name="channelId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Channel</Form.Label>
                  <SelectChannel.FormItem
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
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
