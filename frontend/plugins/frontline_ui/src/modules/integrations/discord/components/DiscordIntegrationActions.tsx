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
import { useParams } from 'react-router-dom';
import { SelectBrands } from 'ui-modules';
import { z } from 'zod';
import { IIntegrationDetail } from '@/integrations/types/Integration';
import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';
import { useIntegrationEdit } from '@/integrations/hooks/useIntegrationEdit';
import { DISCORD_EDIT_SCHEMA } from '../constants/discordSchema';

// Both edit + repair reuse the generic inbox integration mutations; the only
// Discord-specific piece is the repair backend handler (re-validate + reconnect).
const REPAIR_INTEGRATION = gql`
  mutation IntegrationsRepair($_id: String!, $kind: String!) {
    integrationsRepair(_id: $_id, kind: $kind)
  }
`;

/** Edit form for a Discord integration's name and brand. */
const DiscordIntegrationEditForm = ({
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

  const form = useForm<z.infer<typeof DISCORD_EDIT_SCHEMA>>({
    resolver: zodResolver(DISCORD_EDIT_SCHEMA),
  });

  useEffect(() => {
    if (integrationDetail) {
      form.reset({
        name: integrationDetail.name,
        brandId: integrationDetail.brandId ?? '',
      });
    }
  }, [integrationDetail, form]);

  /** Persist the edited Discord integration. */
  const onSubmit = (data: z.infer<typeof DISCORD_EDIT_SCHEMA>) => {
    editIntegration({
      variables: {
        _id: id,
        name: data.name,
        channelId: integrationDetail?.channelId || '',
        brandId: data.brandId,
      },
      onCompleted: () => {
        setOpen(false);
        toast({ title: 'Integration updated' });
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
                  <Form.Label>Name</Form.Label>
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
                  <Form.Label>Brand</Form.Label>
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

/** Row actions (edit dialog) for a Discord integration. */
export const DiscordIntegrationActions = ({
  cell,
}: {
  cell: CellContext<IIntegrationDetail, unknown>;
}) => {
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
        <DiscordIntegrationEditForm
          id={cell.row.original._id}
          setOpen={setOpen}
        />
      </Dialog.Content>
    </Dialog>
  );
};

/** Repair action that re-syncs a broken Discord integration. */
export const DiscordIntegrationRepair = ({
  cell,
}: {
  cell: CellContext<IIntegrationDetail, unknown>;
}) => {
  const { integrationType } = useParams();
  const [repairIntegration, { loading }] = useMutation(REPAIR_INTEGRATION, {
    refetchQueries: ['Integrations'],
  });

  /** Trigger the repair mutation for this integration. */
  const handleRepair = () => {
    if (loading) return;

    repairIntegration({
      variables: { _id: cell.row.original._id, kind: integrationType },
      onCompleted: () => toast({ title: 'Repaired successfully' }),
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
      Repair
    </div>
  );
};
