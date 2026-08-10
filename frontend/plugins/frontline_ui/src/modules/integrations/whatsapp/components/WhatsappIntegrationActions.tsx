import { gql, useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { CellContext } from '@tanstack/react-table';
import { IconEdit, IconTool } from '@tabler/icons-react';
import {
  Button,
  Dialog,
  Form,
  Input,
  Separator,
  Spinner,
  toast,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { SelectBrands } from 'ui-modules';
import { z } from 'zod';
import { IIntegrationDetail } from '@/integrations/types/Integration';
import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';
import { useIntegrationEdit } from '@/integrations/hooks/useIntegrationEdit';
import { WHATSAPP_EDIT_SCHEMA } from '../constants/whatsappSchema';

// Edit + repair both go through the generic inbox integration mutations; the
// WhatsApp-specific part is the backend repair handler, which re-validates the
// stored access token against the Graph API.
const WHATSAPP_REPAIR_INTEGRATION = gql`
  mutation WhatsappIntegrationsRepair($_id: String!, $kind: String!) {
    integrationsRepair(_id: $_id, kind: $kind)
  }
`;

/**
 * `integrationsRepair` is typed `JSON`, and the message broker reports a failed
 * repair inside the payload instead of raising a GraphQL error.
 */
type WhatsappRepairResult = {
  status?: string;
  errorMessage?: string;
};

type WhatsappEditValues = z.infer<typeof WHATSAPP_EDIT_SCHEMA>;

/**
 * Edits a WhatsApp integration's name and brand. Credentials are deliberately
 * absent: the access token and app secret are write-only and are never read
 * back from the server, so they are re-entered through a new connection.
 */
const WhatsappIntegrationEditForm = ({
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

  const form = useForm<WhatsappEditValues>({
    resolver: zodResolver(WHATSAPP_EDIT_SCHEMA),
    defaultValues: { name: '', brandId: '' },
  });

  useEffect(() => {
    if (integrationDetail) {
      form.reset({
        name: integrationDetail.name,
        brandId: integrationDetail.brandId ?? '',
      });
    }
  }, [integrationDetail, form]);

  const onSubmit = (data: WhatsappEditValues) => {
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
      onError: (error: { message: string }) => {
        toast({ title: error.message, variant: 'destructive' });
      },
    });
  };

  if (loading) return <Spinner className="p-20" />;

  return (
    // skipcq: JS-0415
    <>
      <Dialog.Header className="flex-row items-center justify-between space-y-0 px-4 py-3">
        <Dialog.Title>{integrationDetail?.name}</Dialog.Title>
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
              {editLoading && <Spinner size="sm" />}
              {t('save')}
            </Button>
          </Dialog.Footer>
        </form>
      </Form>
    </>
  );
};

/** Row action opening the WhatsApp integration edit dialog. */
export const WhatsappIntegrationActions = ({
  cell,
}: {
  cell: CellContext<IIntegrationDetail, unknown>;
}) => {
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
        <WhatsappIntegrationEditForm
          id={cell.row.original._id}
          setOpen={setOpen}
        />
      </Dialog.Content>
    </Dialog>
  );
};

/** Repair action that re-validates a broken WhatsApp integration. */
export const WhatsappIntegrationRepair = ({
  cell,
}: {
  cell: CellContext<IIntegrationDetail, unknown>;
}) => {
  const { t } = useTranslation('frontline');
  const { integrationType } = useParams();
  const [repairIntegration, { loading }] = useMutation(
    WHATSAPP_REPAIR_INTEGRATION,
    { refetchQueries: ['Integrations'] },
  );

  const handleRepair = () => {
    if (loading) return;

    repairIntegration({
      variables: { _id: cell.row.original._id, kind: integrationType },
      // A failed repair does NOT reject: the message broker catches the Graph
      // API failure and resolves with { status: 'error', errorMessage }, so
      // onError never runs for an expired token — the usual reason to repair.
      // The payload has to be read or the operator is told it worked.
      onCompleted: (data: {
        integrationsRepair?: WhatsappRepairResult | null;
      }) => {
        const result = data?.integrationsRepair;

        if (result?.status === 'error') {
          toast({
            title: t('repair-failed'),
            description: result.errorMessage ?? undefined,
            variant: 'destructive',
          });
          return;
        }

        toast({ title: t('repaired-successfully') });
      },
      onError: (error) =>
        toast({ title: error.message, variant: 'destructive' }),
    });
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleRepair}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleRepair();
        }
      }}
      className="flex items-center gap-2 w-full"
    >
      {loading ? (
        <Spinner className="size-4 text-primary" />
      ) : (
        <IconTool size={16} />
      )}
      {t('repair')}
    </div>
  );
};
