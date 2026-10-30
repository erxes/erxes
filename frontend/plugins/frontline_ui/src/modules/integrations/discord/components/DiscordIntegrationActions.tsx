import {
  IntegrationFormItem,
  IntegrationEditButton,
} from '@/integrations/components/IntegrationPanelForm';

import { useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconTool } from '@tabler/icons-react';
import { Button, Form, Input, Separator, Spinner, toast } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { SelectBrands } from 'ui-modules';
import { z } from 'zod';
import { IIntegration } from '@/integrations/types/Integration';
import { IntegrationType } from '@/types/Integration';
import { gql } from '~/gql';
import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';
import { useIntegrationEdit } from '@/integrations/hooks/useIntegrationEdit';
import { DISCORD_EDIT_SCHEMA } from '../constants/discordSchema';
import { useTranslation } from 'react-i18next';

// Both edit + repair reuse the generic inbox integration mutations; the only
// Discord-specific piece is the repair backend handler (re-validate + reconnect).
const REPAIR_INTEGRATION = gql(`
  mutation IntegrationsRepair($_id: String!, $kind: String!) {
    integrationsRepair(_id: $_id, kind: $kind)
  }
`);

/** Edit form for a Discord integration's name and brand. */
export const DiscordIntegrationEditForm = ({
  id,
  setOpen,
}: {
  id: string;
  setOpen: (open: boolean) => void;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
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
    <Form {...form}>
      <form
        className="flex flex-1 min-h-0 flex-col"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
          <Form.Field
            name="name"
            render={({ field }) => (
              <IntegrationFormItem label={t('name')}>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </IntegrationFormItem>
            )}
          />
          <Form.Field
            name="brandId"
            render={({ field }) => (
              <IntegrationFormItem label={t('brand')}>
                <SelectBrands.FormItem
                  value={field.value}
                  onValueChange={field.onChange}
                />
                <Form.Message />
              </IntegrationFormItem>
            )}
          />
        </div>
        <Separator />
        <div className="flex shrink-0 justify-end gap-1 p-2">
          <Button
            type="button"
            onClick={() => setOpen(false)}
            disabled={loading || editLoading}
            variant="ghost"
          >
            {t('close')}
          </Button>
          <Button type="submit" disabled={loading || editLoading}>
            {t('save')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

/** Row actions (edit dialog) for a Discord integration. */
export const DiscordIntegrationActions = ({
  integration,
}: {
  integration: IIntegration;
}) => {
  return <IntegrationEditButton integration={integration} />;
};

/** Repair action that re-syncs a broken Discord integration. */
export const DiscordIntegrationRepair = ({
  integration,
}: {
  integration: IIntegration;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const kind = integration.kind || IntegrationType.DISCORD_MESSENGER;
  const [repairIntegration, { loading }] = useMutation(REPAIR_INTEGRATION, {
    refetchQueries: ['Integrations', 'ChannelIntegrationsPeek'],
  });

  /** Trigger the repair mutation for this integration. */
  const handleRepair = () => {
    if (loading) return;

    repairIntegration({
      variables: { _id: integration._id, kind },
      onCompleted: () => toast({ title: t('repaired-successfully') }),
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
