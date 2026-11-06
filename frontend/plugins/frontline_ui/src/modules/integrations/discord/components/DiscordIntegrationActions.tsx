import { createIntegrationFormDraft } from '@/integrations/hooks/useIntegrationDraft';
import { Form, Spinner, toast } from 'erxes-ui';
import { PanelFormLayout } from 'ui-modules';
import { IntegrationEditButton } from '@/integrations/components/IntegrationPanelForm';
import {
  IntegrationNameField,
  IntegrationBrandField,
} from '@/integrations/components/IntegrationFormFields';

import { useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconTool } from '@tabler/icons-react';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { IIntegration } from '@/integrations/types/Integration';
import { IntegrationType } from '@/types/Integration';
import { gql } from '~/gql';
import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';
import { useIntegrationEdit } from '@/integrations/hooks/useIntegrationEdit';
import { DISCORD_EDIT_SCHEMA } from '../constants/discordSchema';
import { useTranslation } from 'react-i18next';

const REPAIR_INTEGRATION = gql(`
  mutation IntegrationsRepair($_id: String!, $kind: String!) {
    integrationsRepair(_id: $_id, kind: $kind)
  }
`);

const useFormDraft =
  createIntegrationFormDraft<z.infer<typeof DISCORD_EDIT_SCHEMA>>();

/** Edits the name and brand of a Discord integration. */
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

  const { markSaved, isActive, getSaveValues } = useFormDraft(form, {
    name: integrationDetail?.name ?? '',
    brandId: integrationDetail?.brandId ?? '',
  });

  /** Saves the integration name and brand with success and error feedback. */
  const onSubmit = (data: z.infer<typeof DISCORD_EDIT_SCHEMA>) => {
    const submittedValues = data;
    const savedValues = getSaveValues(data);
    editIntegration({
      variables: {
        _id: id,
        name: savedValues.name,
        channelId: integrationDetail?.channelId || '',
        brandId: savedValues.brandId,
      },
      onCompleted: () => {
        if (markSaved(savedValues, submittedValues) && isActive())
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
        <PanelFormLayout
          onCancel={() => setOpen(false)}
          saving={loading || editLoading}
        >
          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
            <IntegrationNameField />
            <IntegrationBrandField variant="form-item" />
          </div>
        </PanelFormLayout>
      </form>
    </Form>
  );
};

/** Opens the selected Discord integration for editing. */
export const DiscordIntegrationActions = ({
  integration,
}: {
  integration: IIntegration;
}) => {
  return <IntegrationEditButton integration={integration} />;
};

/** Repairs a Discord integration and refreshes affected lists. */
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

  /** Runs the repair mutation unless another repair is in progress. */
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
