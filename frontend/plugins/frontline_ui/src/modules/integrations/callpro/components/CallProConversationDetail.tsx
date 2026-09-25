import { IconPhoneIncoming } from '@tabler/icons-react';
import { Badge, Spinner, formatPhoneNumber, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CustomersInline, useCustomers } from 'ui-modules';
import { useConversationDetail } from '@/inbox/conversations/conversation-detail/hooks/useConversationDetail';
import { CallProCustomerSelect } from '@/integrations/callpro/components/CallProCustomerSelect';
import { useCallProCustomersByPhone } from '@/integrations/callpro/hooks/useCallProCustomersByPhone';

export const CallProConversationDetail = () => {
  const { t } = useTranslation('frontline');
  const [conversationId] = useQueryState<string>('conversationId');

  const { conversationDetail, loading } = useConversationDetail({
    variables: { _id: conversationId },
    skip: !conversationId,
  });

  const {
    _id,
    content,
    customerId,
    callProAudio,
    callProPhone,
    callProPotentialCustomerIds,
  } = conversationDetail || {};

  const candidateIds = callProPotentialCustomerIds || [];
  const needsCustomerSelect = !customerId && candidateIds.length > 1;

  const { customers, loading: candidatesLoading } = useCustomers({
    variables: { ids: candidateIds, limit: candidateIds.length },
    skip: !needsCustomerSelect,
  });

  const { callProCustomersByPhone, loading: byPhoneLoading } =
    useCallProCustomersByPhone({
      variables: { phone: callProPhone || '' },
      skip: needsCustomerSelect || !customerId,
    });

  if (loading) {
    return null;
  }

  return (
    <div className="flex flex-col max-w-[648px] mx-auto p-6 gap-5">
      <div className="flex gap-5 items-end">
        <CustomersInline.Provider customerIds={[customerId || '']}>
          <CustomersInline.Avatar size="xl" />
        </CustomersInline.Provider>
        <div className="shadow-xs p-1 rounded-xl max-w-[500px] flex-auto bg-accent">
          <div className="h-8 pb-1 flex items-center gap-2 px-4">
            <IconPhoneIncoming className="size-4 text-primary" />
            <div className="font-medium">{t('incoming-call')}</div>
            {content && (
              <Badge variant="secondary" className="ml-auto">
                {content}
              </Badge>
            )}
          </div>

          <div className="p-4 bg-background rounded-lg flex flex-col gap-4">
            {callProPhone && (
              <div className="flex flex-col gap-1">
                <div className="text-sm text-accent-foreground">
                  {t('phone-number')}
                </div>
                <div className="font-medium">
                  {formatPhoneNumber({
                    value: callProPhone,
                    defaultCountry: 'MN',
                  })}
                </div>
              </div>
            )}
            {callProAudio ? (
              <audio controls className="w-full">
                <source src={callProAudio} type="audio/wav" />
                {t('callpro-audio-unsupported')}
              </audio>
            ) : (
              <div className="text-sm text-accent-foreground">
                {t('callpro-no-recording')}
              </div>
            )}
          </div>
        </div>
      </div>

      {needsCustomerSelect && (
        <CallProCustomerPicker loading={candidatesLoading}>
          <CallProCustomerSelect
            conversationId={_id || ''}
            customers={customers}
          />
        </CallProCustomerPicker>
      )}

      {!needsCustomerSelect && (callProCustomersByPhone || []).length > 1 && (
        <CallProCustomerPicker loading={byPhoneLoading}>
          <CallProCustomerSelect
            conversationId={_id || ''}
            customers={callProCustomersByPhone || []}
            selectedCustomerId={customerId}
          />
        </CallProCustomerPicker>
      )}
    </div>
  );
};

const CallProCustomerPicker = ({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <div className="flex flex-col gap-2">
      <div className="font-medium">
        {t('callpro-confirm-or-switch-customer')}
      </div>
      {loading ? <Spinner /> : children}
    </div>
  );
};
