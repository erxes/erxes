import { useSetAtom } from 'jotai';
import { callAddSheetAtom } from '../states/callAddSheetAtom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CALL_INTEGRATION_FORM_SCHEMA } from '@/integrations/call/constants/callIntegrationAddSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { CallIntegrationForm } from '@/integrations/call/components/CallIntegrationForm';
import { useIntegrationAdd } from '@/integrations/hooks/useIntegrationAdd';
import { IntegrationType } from '@/types/Integration';
import {
  IntegrationCreateButton,
  useIntegrationChannelId,
} from '@/integrations/components/IntegrationPanelForm';

/** Opens the record panel for creating a call integration. */
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

/** Creates a call integration with validated connection and operator settings. */
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
  const setCallAddSheet = useSetAtom(callAddSheetAtom);

  const { addIntegration, loading } = useIntegrationAdd();

  /** Creates the call integration and closes its setup session after success. */
  const onSubmit = (data: z.infer<typeof CALL_INTEGRATION_FORM_SCHEMA>) => {
    addIntegration({
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
      /** Closes the call setup session after successful creation. */
      onCompleted() {
        setCallAddSheet(false);
      },
    });
  };

  return (
    <CallIntegrationForm form={form} onSubmit={onSubmit} loading={loading} />
  );
};
