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

export const CallTabs = ({ keypad }: { keypad: React.ReactNode }) => {
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
          Call history
        </CallTabsTrigger>
        <CallTabsTrigger value="keypad">
          <IconDialpadFilled />
          Call
        </CallTabsTrigger>
        <CallTabsTrigger value="address-book">
          <IconAddressBook />
          Contact
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

export const Dialpad = ({ addCustomer }: { addCustomer: any }) => {
  return (
    <div className="px-3 pt-3">
      <CallSipActions />
      <CallNumberInput />
      <SelectPhoneCallFrom />
      <CallButton addCustomer={addCustomer} />
    </div>
  );
};

export const CallButton = ({ addCustomer }: { addCustomer: any }) => {
  const { startCall } = useSip();
  const sipState = useAtomValue(sipStateAtom);
  const [callConfig] = useAtom(callConfigAtom);
  const phoneNumber = useAtomValue(callNumberState);

  const call = () => {
    if (phoneNumber && phoneNumber.length > 0) {
      addCustomer(callConfig?.inboxId || '', phoneNumber, sipState.groupName);
      startCall(phoneNumber);
    }
  };

  return (
    <Button
      className="my-3 w-full"
      disabled={!phoneNumber || !phoneNumber.length}
      onClick={call}
    >
      Call
    </Button>
  );
};
