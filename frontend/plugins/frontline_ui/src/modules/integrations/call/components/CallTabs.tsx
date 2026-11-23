import { useTranslation } from 'react-i18next';
import { CallContacts } from '@/integrations/call/components/CallContacts';
import { CallHistory } from '@/integrations/call/components/CallHistory';
import { CallNumberInput } from '@/integrations/call/components/CallNumberInput';
import { CallSipActions } from '@/integrations/call/components/CallSipActions';
import { SelectPhoneCallFrom } from '@/integrations/call/components/SelectPhoneCallFrom';
import { useSip } from '@/integrations/call/components/SipProvider';
import { callUiAtom } from '@/integrations/call/states/callUiAtom';
import { callNumberState } from '@/integrations/call/states/callWidgetStates';
import {
  callConfigAtom,
  sipStateAtom,
} from '@/integrations/call/states/sipStates';
import {
  IconAddressBook,
  IconDialpadFilled,
  IconHistory,
} from '@tabler/icons-react';
import { Button, Tabs } from 'erxes-ui';
import { useAtom, useAtomValue } from 'jotai';
import {
  CallStatusEnum,
  SipStatusEnum,
} from '@/integrations/call/types/sipTypes';
import { TAddCallCustomer } from '@/integrations/call/hooks/useAddCustomer';

export const CallTabs = ({ keypad }: { keypad: React.ReactNode }) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const [callUi, setCallUi] = useAtom(callUiAtom);

  return (
    <Tabs defaultValue="keypad" value={callUi} onValueChange={setCallUi}>
      <Tabs.Content value="history">
        <CallHistory />
      </Tabs.Content>
      <Tabs.Content value="keypad">{keypad}</Tabs.Content>
      <Tabs.Content value="address-book">
        <CallContacts />
      </Tabs.Content>
      <Tabs.List className="grid grid-cols-3 p-1 border-t border-b-0">
        <CallTabsTrigger value="history">
          <IconHistory />
          {t('call-history')}
        </CallTabsTrigger>
        <CallTabsTrigger value="keypad">
          <IconDialpadFilled />
          {t('call')}
        </CallTabsTrigger>
        <CallTabsTrigger value="address-book">
          <IconAddressBook />
          {t('contact')}
        </CallTabsTrigger>
      </Tabs.List>
    </Tabs>
  );
};

const CallTabsTrigger = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: string;
}) => {
  return (
    <Button
      className="flex-col h-12 gap-1 [&>svg]:size-5 data-[state=active]:hover:bg-accent-foreground/10 after:hidden"
      variant="ghost"
      asChild
    >
      <Tabs.Trigger value={value}>{children}</Tabs.Trigger>
    </Button>
  );
};

export const Dialpad = ({ addCustomer }: { addCustomer: TAddCallCustomer }) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const { startCall } = useSip();
  const sipState = useAtomValue(sipStateAtom);
  const callConfig = useAtomValue(callConfigAtom);
  const phoneNumber = useAtomValue(callNumberState);

  const canCall =
    !!phoneNumber &&
    sipState.sipStatus === SipStatusEnum.REGISTERED &&
    sipState.callStatus === CallStatusEnum.IDLE;

  const call = () => {
    if (!canCall) return;
    addCustomer(callConfig?.inboxId || '', phoneNumber);
    startCall(phoneNumber);
  };

  return (
    <div className="px-3 pt-3">
      <CallSipActions />
      <CallNumberInput onSubmit={call} />
      <SelectPhoneCallFrom />
      <Button className="my-3 w-full" disabled={!canCall} onClick={call}>
        {t('call')}
      </Button>
    </div>
  );
};
