import { callEditSheetAtom } from '@/integrations/call/states/callEditSheetAtom';
import { useAtom } from 'jotai';
import { isDefined, Sheet, Spinner, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CALL_INTEGRATION_FORM_SCHEMA } from '@/integrations/call/constants/callIntegrationAddSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { CallIntegrationForm } from '@/integrations/call/components/CallIntegrationForm';
import { useEffect } from 'react';
import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';
import { useCallIntegrationDetail } from '@/integrations/call/hooks/useCallIntegrationDetail';
import { useIntegrationEdit } from '@/integrations/hooks/useIntegrationEdit';

export const CallIntegrationSheetEdit = () => {
  const [callEditSheet, setCallEditSheet] = useAtom(callEditSheetAtom);

  return (
    <Sheet open={!!callEditSheet} onOpenChange={() => setCallEditSheet(null)}>
      <Sheet.View className="sm:max-w-3xl">
        <CallIntegrationEdit />
      </Sheet.View>
    </Sheet>
  );
};

export const CallIntegrationEdit = () => {
  const { t } = useTranslation('frontline');

  const [integrationId, setEditSheet] = useAtom(callEditSheetAtom);
  const { integrationDetail, loading } = useIntegrationDetail({
    integrationId,
  });
  const { callsIntegrationDetail, loading: callLoading } =
    useCallIntegrationDetail();

  const { editIntegration, loading: editLoading } = useIntegrationEdit();

  const form = useForm<z.infer<typeof CALL_INTEGRATION_FORM_SCHEMA>>({
    resolver: zodResolver(CALL_INTEGRATION_FORM_SCHEMA),
  });

  const onSubmit = (data: z.infer<typeof CALL_INTEGRATION_FORM_SCHEMA>) => {
    // The channel comes from the record, so editing works from any page.
    if (!integrationId || !integrationDetail) return;
    editIntegration({
      variables: {
        _id: integrationId,
        name: data.name,
        channelId: integrationDetail.channelId ?? '',
        brandId: data.brandId,
        details: {
          phone: data.phone,
          wsServer: data.websocketServer,
          srcTrunk: data?.srcTrunk || '',
          dstTrunk: data?.dstTrunk || '',
          queues: data.queues
            ? data.queues
                .split(',')
                .map((q) => q.trim())
                .filter((q) => q.length > 0)
            : [],
          operators: data.operators,
        },
      },
      refetchQueries: [
        'Integrations',
        'callsIntegrationDetail',
        'IntegrationDetail',
        'ChannelIntegrationsPeek',
      ],
      onCompleted() {
        setEditSheet(null);
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
        setEditSheet(null);
      },
    });
  };

  useEffect(() => {
    if (
      integrationDetail &&
      !loading &&
      !callLoading &&
      callsIntegrationDetail
    ) {
      form.reset({
        name: integrationDetail.name || '',
        brandId: integrationDetail.brandId || '',
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [integrationDetail, callsIntegrationDetail, callLoading, loading]);

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
