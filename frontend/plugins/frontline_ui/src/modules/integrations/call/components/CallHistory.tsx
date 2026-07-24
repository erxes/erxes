import { useCallHistories } from '@/integrations/call/hooks/useCallHistories';
import { callUiAtom } from '@/integrations/call/states/callUiAtom';
import { callNumberState } from '@/integrations/call/states/callWidgetStates';
import { useTranslation } from 'react-i18next';
import {
  IconArrowUpRight,
  IconPhoneIncoming,
  IconPhoneOutgoing,
  IconPhoneX,
} from '@tabler/icons-react';
import {
  Tabs,
  Command,
  Combobox,
  Input,
  Separator,
  Spinner,
  formatPhoneNumber,
  cn,
  Button,
  Tooltip,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { safeFormatDate } from '@/integrations/call/utils/callUtils';

export const CallHistory = () => {
  const { t } = useTranslation('frontline');
  const [totalCalls, setTotalCalls] = useState(0);
  return (
    <Tabs defaultValue="all">
      <Tabs.List className="grid grid-cols-4 gap-1 px-2">
        <Tabs.Trigger value="all">
          {t('all-count', { count: totalCalls })}
        </Tabs.Trigger>
        <Tabs.Trigger value="incoming">{t('incoming')}</Tabs.Trigger>
        <Tabs.Trigger value="outgoing">{t('outgoing')}</Tabs.Trigger>
        <Tabs.Trigger value="missed">{t('missed')}</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="all" className="h-96">
        <CallHistoryList setTotalCalls={setTotalCalls} />
      </Tabs.Content>
      <Tabs.Content value="incoming" className="h-96">
        <CallHistoryList callType="incoming" />
      </Tabs.Content>
      <Tabs.Content value="outgoing" className="h-96">
        <CallHistoryList callType="outgoing" />
      </Tabs.Content>
      <Tabs.Content value="missed" className="h-96">
        <CallHistoryList missed />
      </Tabs.Content>
    </Tabs>
  );
};

export const CallHistoryList = ({
  missed = false,
  callType,
  setTotalCalls,
}: {
  missed?: boolean;
  callType?: string;
  setTotalCalls?: (totalCalls: number) => void;
}) => {
  const { t } = useTranslation('frontline');
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const { callHistoriesTotalCount, callHistories, loading, handleFetchMore } =
    useCallHistories({ missed, callType, searchValue: debouncedSearch });
  const setCallUi = useSetAtom(callUiAtom);
  const setPhone = useSetAtom(callNumberState);
  const navigate = useNavigate();

  useEffect(() => {
    if (setTotalCalls) {
      setTotalCalls(callHistoriesTotalCount || 0);
    }
  }, [callHistoriesTotalCount, setTotalCalls]);

  return (
    <Command shouldFilter={false}>
      <div className="p-3">
        <Command.Input
          asChild
          wrapperClassName="border-b-0"
          className="h-7"
          value={search}
          onValueChange={setSearch}
          placeholder={t('search-by-phone-number')}
        >
          <Input />
        </Command.Input>
      </div>
      <Separator />
      <Command.List className="p-3 flex-auto max-h-full">
        {loading && (
          <div className="flex justify-center py-4">
            <Spinner size="sm" />
          </div>
        )}
        {!loading && !callHistories?.length && (
          <div className="py-4 text-center text-sm text-accent-foreground">
            {t('no-calls')}
          </div>
        )}
        {callHistories?.map((callHistory) => {
          const isMissedCall = callHistory.callStatus !== 'connected';
          return (
            <Command.Item
              key={callHistory._id}
              className="h-7 p-2 pl-1 font-medium"
              value={callHistory._id + '|' + callHistory.customerPhone}
              onSelect={() => {
                setCallUi('keypad');
                setPhone(callHistory.customerPhone);
              }}
            >
              {isMissedCall ? (
                <IconPhoneX className="text-destructive" />
              ) : callHistory.callType === 'incoming' ? (
                <IconPhoneIncoming className="text-success" />
              ) : (
                <IconPhoneOutgoing className="text-success" />
              )}
              <span className={cn(isMissedCall && 'text-destructive')}>
                {formatPhoneNumber({ value: callHistory.customerPhone })}
              </span>
              <span className="ml-auto text-accent-foreground">
                {callHistory.callStartTime
                  ? safeFormatDate(callHistory.callStartTime, 'MMM, dd, HH:mm')
                  : ''}
              </span>
              <Tooltip.Provider>
                <Tooltip>
                  <Tooltip.Trigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(
                          `/frontline/inbox?conversationId=${callHistory.conversationId}`,
                        );
                      }}
                    >
                      <IconArrowUpRight />
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content>{t('go-to-conversation')}</Tooltip.Content>
                </Tooltip>
              </Tooltip.Provider>
            </Command.Item>
          );
        })}
        {!loading && (
          <Combobox.FetchMore
            fetchMore={handleFetchMore}
            currentLength={callHistories?.length || 0}
            totalCount={callHistoriesTotalCount || 0}
          />
        )}
      </Command.List>
    </Command>
  );
};
