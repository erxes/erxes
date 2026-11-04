import { createIntegrationFormDraft } from '@/integrations/hooks/useIntegrationDraft';
import { useSidePanel } from 'ui-modules';
import { isDefined, Spinner, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CALL_INTEGRATION_FORM_SCHEMA } from '@/integrations/call/constants/callIntegrationAddSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { CallIntegrationForm } from '@/integrations/call/components/CallIntegrationForm';
import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';
import { useCallIntegrationDetail } from '@/integrations/call/hooks/useCallIntegrationDetail';
import { useIntegrationEdit } from '@/integrations/hooks/useIntegrationEdit';
import { CALL_INTEGRATION_DETAIL } from '@/integrations/call/graphql/queries/callConfigQueries';

const useFormDraft =
  createIntegrationFormDraft<z.infer<typeof CALL_INTEGRATION_FORM_SCHEMA>>();

/** Loads and edits a call integration's connection and operator settings. */
export const CallIntegrationEdit = ({ id: integrationId }: { id: string }) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });

  const { close } = useSidePanel();
  const { integrationDetail, loading } = useIntegrationDetail({
    integrationId,
  });
  const { callsIntegrationDetail, loading: callLoading } =
    useCallIntegrationDetail(integrationId);

  const { editIntegration, loading: editLoading } = useIntegrationEdit();

  const form = useForm<z.infer<typeof CALL_INTEGRATION_FORM_SCHEMA>>({
    resolver: zodResolver(CALL_INTEGRATION_FORM_SCHEMA),
  });

  const { markSaved, isActive, getSaveValues } = useFormDraft(form, {
    name: integrationDetail?.name || '',
    brandId: integrationDetail?.brandId || '',
    phone: callsIntegrationDetail?.phone || '',
    websocketServer: callsIntegrationDetail?.wsServer || '',
    srcTrunk: callsIntegrationDetail?.srcTrunk || '',
    dstTrunk: callsIntegrationDetail?.dstTrunk || '',
    queues: Array.isArray(callsIntegrationDetail?.queues)
      ? callsIntegrationDetail?.queues.join(',')
      : callsIntegrationDetail?.queues || '',
    operators: (callsIntegrationDetail?.operators ?? [])
      .filter(isDefined)
      .map((operator) => ({
        userId: operator.userId ?? undefined,
        gsUsername: operator.gsUsername ?? '',
        gsPassword: operator.gsPassword ?? '',
      })),
  });

  const onSubmit = (data: z.infer<typeof CALL_INTEGRATION_FORM_SCHEMA>) => {
    if (!integrationId || !integrationDetail) return;
    const submittedValues = data;
    const savedValues = getSaveValues(data);
    editIntegration({
      variables: {
        _id: integrationId,
        name: savedValues.name,
        channelId: integrationDetail.channelId ?? '',
        brandId: savedValues.brandId,
        details: {
          phone: savedValues.phone,
          wsServer: savedValues.websocketServer,
          srcTrunk: savedValues.srcTrunk || '',
          dstTrunk: savedValues.dstTrunk || '',
          queues: savedValues.queues
            ? savedValues.queues
                .split(',')
                .map((q) => q.trim())
                .filter((q) => q.length > 0)
            : [],
          operators: savedValues.operators,
        },
      },
      refetchQueries: [
        'Integrations',
        {
          query: CALL_INTEGRATION_DETAIL,
          variables: { integrationId },
        },
        'IntegrationDetail',
        'ChannelIntegrationsPeek',
      ],
      onCompleted() {
        if (markSaved(savedValues, submittedValues) && isActive()) close();
        toast({
          title: t('integration-updated'),
          description: t('integration-updated-successfully'),
        });
      },
      onError(e) {
        toast({
          title: t('something-went-wrong'),
          description: e.message,
          variant: 'destructive',
        });
      },
    });
  };

  if (loading || callLoading) {
    return <Spinner className="h-full" />;
  }

  return (
    <CallIntegrationForm
      form={form}
      onSubmit={onSubmit}
      loading={editLoading}
    />
  );
};

export { CallIntegrationEdit as CallIntegrationSheetEdit };
