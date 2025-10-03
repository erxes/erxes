import { useCallHistories } from '@/integrations/call/hooks/useCallHistories';
import { callUiAtom } from '@/integrations/call/states/callUiAtom';
import { callNumberState } from '@/integrations/call/states/callWidgetStates';
import {
  IconArrowUpRight,
  IconPhoneOutgoing,
  IconPhoneX,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import {
  Tabs,
  Command,
  Input,
  Separator,
  formatPhoneNumber,
  cn,
  Button,
  Tooltip,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const CallHistory = () => {
  const [totalCalls, setTotalCalls] = useState(0);
  return (
    <Tabs defaultValue="all">
      <Tabs.List className="grid grid-cols-2 px-2">
        <Tabs.Trigger value="all">All calls ({totalCalls})</Tabs.Trigger>
        <Tabs.Trigger value="missed">Missed calls</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="all" className="h-96">
        <CallHistoryList missed={false} setTotalCalls={setTotalCalls} />
      </Tabs.Content>
      <Tabs.Content value="missed" className="h-96">
        <CallHistoryList missed={true} />
      </Tabs.Content>
    </Tabs>
  );
};

export const CallHistoryList = ({
  missed = false,
  setTotalCalls,
}: {
  missed?: boolean;
  setTotalCalls?: (totalCalls: number) => void;
}) => {
  const { callHistoriesTotalCount, callHistories } = useCallHistories(missed);
  const setCallUi = useSetAtom(callUiAtom);
  const setPhone = useSetAtom(callNumberState);
  const navigate = useNavigate();

  useEffect(() => {
    if (setTotalCalls && callHistoriesTotalCount) {
      setTotalCalls(callHistoriesTotalCount || 0);
    }
  }, [callHistoriesTotalCount, setTotalCalls]);

  return (
    <Command>
      <div className="p-3">
        <Command.Input asChild wrapperClassName="border-b-0" className="h-7">
          <Input />
        </Command.Input>
      </div>
      <Separator />
      <Command.List className="p-3 flex-auto max-h-full">
        <Command.Empty />
        {callHistories?.map((callHistory) => (
          <Command.Item
            className="h-7 p-2 pl-1 font-medium"
            value={callHistory._id + '|' + callHistory.customerPhone}
            onSelect={() => {
              setCallUi('keypad');
              setPhone(callHistory.customerPhone);
            }}
          >
            {callHistory.callStatus === 'cancelled' ? (
              <IconPhoneX className="text-destructive" />
            ) : (
              <IconPhoneOutgoing className="text-accent-foreground" />
            )}
            <span
              className={cn(
                callHistory.callStatus === 'cancelled' && 'text-destructive',
              )}
            >
              {formatPhoneNumber({ value: callHistory.customerPhone })}
            </span>
            <span className="ml-auto text-accent-foreground">
              {format(new Date(callHistory.callStartTime), 'MMM, dd, HH:mm')}
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
                <Tooltip.Content>Go to conversation</Tooltip.Content>
              </Tooltip>
            </Tooltip.Provider>
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
