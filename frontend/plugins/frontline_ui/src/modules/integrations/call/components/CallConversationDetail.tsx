import { useSetAtom } from 'jotai';
import { CallConversationNotes } from './CallConversationNotes';
import { useEffect } from 'react';
import {
  isInternalState,
  onlyInternalState,
} from '@/inbox/conversations/conversation-detail/states/isInternalState';
import {
  Badge,
  Button,
  REACT_APP_API_URL,
  toast,
  useQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useCallConversationDetail } from '@/integrations/call/hooks/useCallConversationDetail';
import { CustomersInline } from 'ui-modules';
import { useConversationDetail } from '@/inbox/conversations/conversation-detail/hooks/useConversationDetail';
import {
  IconPhoneOutgoing,
  IconPhoneIncoming,
  IconRefresh,
} from '@tabler/icons-react';
import {
  formatSeconds,
  safeFormatDate,
} from '@/integrations/call/utils/callUtils';
import {
  CALL_STATUS_LABEL_KEYS,
  NOT_ANSWERED_STATUSES,
  normalizeCallDirection,
  normalizeCallStatus,
} from '@/integrations/call/utils/callContentUtils';
import { useCallSyncAudioRecord } from '@/integrations/call/hooks/useCallSyncAudioRecord';

const getRecordingUrl = (value: string) => {
  if (value.startsWith('http') || value.startsWith('/')) return value;
  return `${REACT_APP_API_URL}/read-file?key=${encodeURIComponent(value)}`;
};

export function CallConversationDetail() {
  const { t } = useTranslation('frontline');
  const [conversationId] = useQueryState<string>('conversationId');
  const { conversationDetail, loading } = useConversationDetail({
    variables: {
      _id: conversationId,
    },
    skip: !conversationId,
  });
  const { callSyncRecordFile, loading: syncFileLoading } =
    useCallSyncAudioRecord(conversationId);

  const { callHistoryDetail } = useCallConversationDetail({
    conversationId: conversationId || '',
  });
  const setIsInternalNote = useSetAtom(isInternalState);
  const setOnlyInternal = useSetAtom(onlyInternalState);

  useEffect(() => {
    setIsInternalNote(true);
    setOnlyInternal(true);
  }, []);

  const syncRecord = async (acctId: string, inboxId: string) => {
    try {
      if (acctId && inboxId)
        await callSyncRecordFile({ variables: { acctId, inboxId } });
    } catch (e: any) {
      toast({
        title: t('something-went-wrong'),
        description: e.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return null;
  }

  const {
    callType,
    callStatus,
    callDuration,
    callStartTime,
    callEndTime,
    recordUrl,
    acctId,
    inboxIntegrationId,
  } = callHistoryDetail || {};

  const direction = normalizeCallDirection(callType);
  const status = normalizeCallStatus(callStatus);
  const isNotAnswered = !!status && NOT_ANSWERED_STATUSES.includes(status);

  const formatCallTime = (value?: Date | string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    return isNaN(date.getTime())
      ? '-'
      : safeFormatDate(date, 'yyyy-MM-dd HH:mm:ss');
  };
  return (
    <>
      {callHistoryDetail && (
        <div className="flex flex-col max-w-[648px] mx-auto p-6">
          <div className="flex gap-5 items-end">
            <CustomersInline.Provider
              customerIds={[conversationDetail?.customerId || '']}
            >
              <CustomersInline.Avatar size="xl" />
            </CustomersInline.Provider>
            <div className="shadow-xs p-1 rounded-xl max-w-[500px] flex-auto bg-accent">
              <div className="h-8 pb-1 flex items-center gap-2 px-4">
                {direction === 'outgoing' && (
                  <IconPhoneOutgoing className="size-4 text-primary" />
                )}
                {direction === 'incoming' && (
                  <IconPhoneIncoming className="size-4 text-primary" />
                )}
                <div className="font-medium">
                  {direction === 'incoming'
                    ? t('incoming-call')
                    : direction === 'outgoing'
                    ? t('outgoing-call')
                    : t('call')}
                </div>
                {status && (
                  <Badge
                    variant={
                      status === 'answered'
                        ? 'success'
                        : isNotAnswered
                        ? 'destructive'
                        : 'warning'
                    }
                    className="ml-auto"
                  >
                    {t(CALL_STATUS_LABEL_KEYS[status])}
                  </Badge>
                )}
              </div>

              <div className="p-4 bg-background rounded-lg">
                <div className="flex items-center gap-2 justify-between mb-4">
                  <div className="flex flex-col gap-1">
                    <div className="text-sm text-accent-foreground">
                      {t('duration')}
                    </div>
                    <div className="font-medium">
                      {formatSeconds(callDuration)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 text-sm">
                    <div className="text-sm text-accent-foreground">
                      {t('start-time')}
                    </div>
                    <div className="font-medium">
                      {formatCallTime(callStartTime)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="text-sm text-accent-foreground">
                      {t('end-time')}
                    </div>
                    <div className="font-medium">
                      {formatCallTime(callEndTime)}
                    </div>
                  </div>
                </div>
                {recordUrl && (
                  <audio controls className="w-full">
                    <source src={getRecordingUrl(recordUrl)} type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>
                )}
                <div className="font-medium">
                  <Button
                    id="cdrRecordUrl"
                    size="sm"
                    disabled={syncFileLoading}
                    onClick={() => {
                      syncRecord(acctId, inboxIntegrationId);
                    }}
                    className="flex top-2"
                  >
                    <IconRefresh />
                    {t('sync-record-file')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <CallConversationNotes />
    </>
  );
}
