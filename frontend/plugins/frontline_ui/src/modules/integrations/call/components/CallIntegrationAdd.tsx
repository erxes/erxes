import { createIntegrationFormDraft } from '@/integrations/hooks/useIntegrationDraft';
import { useSidePanel } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CALL_INTEGRATION_FORM_SCHEMA } from '@/integrations/call/constants/callIntegrationAddSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { CallIntegrationForm } from '@/integrations/call/components/CallIntegrationForm';
import { useSocialIntegrationCreate } from '@/integrations/hooks/useSocialIntegrationCreate';
import { useEffect } from 'react';
import { INTEGRATION_CONTENT_TYPE } from '@/integrations/components/IntegrationPanelForm';
import { IntegrationType } from '@/types/Integration';
import {
  IntegrationCreateButton,
  useIntegrationChannelId,
} from '@/integrations/components/IntegrationPanelForm';

const useFormDraft =
  createIntegrationFormDraft<z.infer<typeof CALL_INTEGRATION_FORM_SCHEMA>>();

export const CallIntegrationAddSheet = () => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  return (
    <IntegrationCreateButton kind={IntegrationType.CALL}>
      {t('add-call')}
    </IntegrationCreateButton>
  );
};

/** Creates a call integration through the record panel form. */
export const CallIntegrationAdd = () => {
  const id = useIntegrationChannelId();

  const form = useForm<z.infer<typeof CALL_INTEGRATION_FORM_SCHEMA>>({
    resolver: zodResolver(CALL_INTEGRATION_FORM_SCHEMA),
    defaultValues: {
      name: '',
      phone: '',
      websocketServer: '',
      brandId: '',
      queues: '',
    },
  });
  const { isActive } = useFormDraft(form);
  const { openRecord } = useSidePanel();

  const { createIntegration, createdId, loading } =
    useSocialIntegrationCreate();
  useEffect(() => {
    if (createdId && isActive())
      openRecord(
        { contentType: INTEGRATION_CONTENT_TYPE, contentId: createdId },
        { replace: true },
      );
  }, [createdId, isActive, openRecord]);

  /** Creates the configured call integration and closes the panel on success. */
  const onSubmit = (data: z.infer<typeof CALL_INTEGRATION_FORM_SCHEMA>) => {
    return createIntegration({
      variables: {
        name: data.name,
        kind: IntegrationType.CALL,
        channelId: id || '',
        brandId: data.brandId,
        data: {
          phone: data.phone,
          wsServer: data.websocketServer,
          queues: data.queues,
          srcTrunk: data.srcTrunk,
          dstTrunk: data.dstTrunk,
          operators: data.operators,
        },
      },
    });
  };

  return (
    <CallIntegrationForm form={form} onSubmit={onSubmit} loading={loading} />
  );
};
