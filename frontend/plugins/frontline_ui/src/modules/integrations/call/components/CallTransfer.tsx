import { InCallActionButton } from '@/integrations/call/components/InCall';
import { useExtentionList, useTransferCall } from '@/integrations/call/hooks/useTransferCall';
import { inCallViewAtom } from '@/integrations/call/states/callStates';
import { callConfigAtom } from '@/integrations/call/states/sipStates';
import { IconCheck, IconPhoneOutgoing } from '@tabler/icons-react';
import { Button, Label, Select, Toggle, cn, toast } from 'erxes-ui';
import { useAtom, useAtomValue } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const TransferTrigger = () => {
  const { t } = useTranslation('frontline');
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
        {t('transfer')}
      </Toggle>
    </InCallActionButton>
  );
};

export const Transfer = () => {
  const { t } = useTranslation('frontline');
  const [inCallView, setInCallView] = useAtom(inCallViewAtom);
  const config = useAtomValue(callConfigAtom);
  const { callExtensionList, loading } = useExtentionList({
    skip: inCallView !== 'transfer',
  });
  const { transferCall } = useTransferCall();
  const [selectedExtension, setSelectedExtension] = useState('');

  if (inCallView !== 'transfer') {
    return null;
  }

  const handleTransfer = async () => {
    if (!selectedExtension || !config?.inboxId) return;
    try {
      const result = await transferCall({
        variables: {
          extensionNumber: selectedExtension,
          integrationId: config.inboxId,
        },
      });
      if (result?.data?.callTransfer === 'success') {
        toast({ title: t('transfer'), description: t('transfer-success') });
        setInCallView(null);
      } else {
        toast({
          title: t('transfer'),
          description: t('transfer-failed'),
          variant: 'destructive',
        });
      }
    } catch (e) {
      toast({
        title: t('transfer'),
        description: t('something-went-wrong'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-3 px-3 pb-3">
      <div className="space-y-2">
        <Label>{t('transfer-to')}</Label>
        <Select
          disabled={loading}
          value={selectedExtension}
          onValueChange={setSelectedExtension}
        >
          <Select.Trigger>
            <Select.Value placeholder={t('select-an-extension')} />
          </Select.Trigger>
          <Select.Content>
            {callExtensionList?.map((extension) => (
              <Select.Primitive.Item
                key={extension._id}
                value={extension.extension}
                className={cn(
                  'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-hidden focus:bg-accent data-disabled:pointer-events-none data-disabled:opacity-50',
                )}
              >
                <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                  <Select.Primitive.ItemIndicator>
                    <IconCheck className="w-4 h-4" />
                  </Select.Primitive.ItemIndicator>
                </span>
                <Select.Primitive.ItemText>
                  {extension.fullname} ({extension.extension})
                </Select.Primitive.ItemText>
                <span className="ml-2 text-accent-foreground text-xs">
                  {extension.status}
                </span>
              </Select.Primitive.Item>
            ))}
          </Select.Content>
        </Select>
      </div>
      <div className="flex flex-col gap-1">
        <Button
          variant="secondary"
          disabled={!selectedExtension}
          onClick={handleTransfer}
        >
          {t('transfer')}
        </Button>
        <Button
          variant="ghost"
          className="text-accent-foreground"
          onClick={() => setInCallView(null)}
        >
          {t('cancel')}
        </Button>
      </div>
    </div>
  );
};
