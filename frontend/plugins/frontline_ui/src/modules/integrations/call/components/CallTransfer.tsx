import { InCallActionButton } from '@/integrations/call/components/InCall';
import { useExtentionList } from '@/integrations/call/hooks/useTransferCall';
import { inCallViewAtom } from '@/integrations/call/states/callStates';
import { IconPhoneOutgoing } from '@tabler/icons-react';
import { Button, Label, Select, Toggle } from 'erxes-ui';
import { useAtom, useAtomValue } from 'jotai';

export const TransferTrigger = () => {
  const [inCallView, setInCallView] = useAtom(inCallViewAtom);
  return (
    <InCallActionButton
      asChild
      className="data-[state=on]:bg-muted data-[state=on]:text-foreground"
    >
      <Toggle
        pressed={inCallView === 'transfer'}
        onPressedChange={(pressed) =>
          setInCallView(pressed ? 'transfer' : null)
        }
      >
        <IconPhoneOutgoing />
        Transfer
      </Toggle>
    </InCallActionButton>
  );
};
export const Transfer = () => {
  const inCallView = useAtomValue(inCallViewAtom);
  const { callExtensionList, loading } = useExtentionList({
    skip: inCallView !== 'transfer',
  });

  if (inCallView !== 'transfer') {
    return null;
  }

  return (
    <div className="space-y-3 px-3 pb-3">
      <div className="space-y-2">
        <Label>Transfer to</Label>
        <Select disabled={loading}>
          <Select.Trigger>
            <Select.Value placeholder="Select an extension" />
          </Select.Trigger>
          <Select.Content>
            {callExtensionList?.map((extension) => (
              <Select.Item key={extension._id} value={extension._id}>
                {extension.fullname} ({extension.extension})
                <span className="ml-auto">{extension.status}</span>
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <Button variant="secondary">Transfer</Button>
        <Button variant="ghost" className="text-accent-foreground">
          Cancel
        </Button>
      </div>
    </div>
  );
};
