import { CellContext } from '@tanstack/react-table';
import { IconEdit } from '@tabler/icons-react';
import {
  Button,
  Dialog,
  Form,
  Input,
  Separator,
  Sheet,
  Spinner,
  toast,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectBrands } from 'ui-modules';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';
import { useIntegrationEdit } from '@/integrations/hooks/useIntegrationEdit';
import { IIntegrationDetail } from '@/integrations/types/Integration';
import { WHATSAPP_INTEGRATION_SCHEMA } from '../constants/whatsappIntegrationSchema';
import { WhatsappIntegrationFormSheet } from './WhatsappIntegrationForm';

export const WhatsappIntegrationDetail = () => {
  return (
    <div>
      <WhatsappIntegrationFormSheet />
    </div>
  );
};

export const WhatsappIntegrationActions = ({
  cell,
}: {
  cell: CellContext<IIntegrationDetail, unknown>;
}) => {
  return <WhatsappIntegrationEditSheet id={cell.row.original._id} />;
};

export const WhatsappIntegrationEditSheet = ({ id }: { id: string }) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <div className="flex items-center gap-2 w-full">
          <IconEdit size={16} />
          {t('edit')}
        </div>
      </Dialog.Trigger>
      <Dialog.Content className="p-0 gap-0 border-0 shadow-lg">
        <WhatsappIntegrationEditForm id={id} setOpen={setOpen} />
      </Dialog.Content>
    </Dialog>
  );
};

export const WhatsappIntegrationEditForm = ({
  id,
  setOpen,
}: {
  id: string;
  setOpen: (open: boolean) => void;
}) => {
  const { t } = useTranslation('frontline');
  const { loading, integrationDetail } = useIntegrationDetail({
    integrationId: id,
  });
  const { editIntegration, loading: editLoading } = useIntegrationEdit();
  const form = useForm<z.infer<typeof WHATSAPP_INTEGRATION_SCHEMA>>({
    resolver: zodResolver(WHATSAPP_INTEGRATION_SCHEMA),
  });

  useEffect(() => {
    if (integrationDetail) {
      form.reset({
        name: integrationDetail.name,
        brandId: integrationDetail.brandId ?? '',
      });
    }
  }, [integrationDetail, form]);

  const onSubmit = (data: z.infer<typeof WHATSAPP_INTEGRATION_SCHEMA>) => {
    editIntegration({
      variables: {
        _id: id,
        name: data.name,
        channelId: integrationDetail?.channelId || '',
        brandId: data.brandId,
      },
      onCompleted: () => {
        setOpen(false);
        toast({ title: t('integration-updated') });
      },
      onError: (error) => {
        toast({ title: error.message, variant: 'destructive' });
      },
    });
  };

  if (loading) {
    return <Spinner className="p-20" />;
  }

  return (
    <>
      <Dialog.Header className="flex-row items-center justify-between space-y-0 px-4 py-3">
        <Dialog.Title>{integrationDetail?.name}</Dialog.Title>
        <Sheet.Close />
      </Dialog.Header>
      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="p-6 pb-8 space-y-6">
            <Form.Field
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('name')}</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              name="brandId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('brand')}</Form.Label>
                  <SelectBrands.FormItem
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
                {t('close')}
              </Button>
            </Dialog.Close>
            <Button type="submit" disabled={loading || editLoading}>
              {t('save')}
            </Button>
          </Dialog.Footer>
        </form>
      </Form>
    </>
  );
};
