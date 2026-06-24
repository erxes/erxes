import { InCallActionButton } from '@/integrations/call/components/InCall';
import { useExtentionList } from '@/integrations/call/hooks/useTransferCall';
import { inCallViewAtom } from '@/integrations/call/states/callStates';
import { IconPhoneOutgoing } from '@tabler/icons-react';
import { Button, Label, Select, Toggle } from 'erxes-ui';
import { useAtom, useAtomValue } from 'jotai';
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
        <Label>{t('transfer-to')}</Label>
        <Select disabled={loading}>
          <Select.Trigger>
            <Select.Value placeholder={t('select-an-extension')} />
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
        <Button variant="secondary">{t('transfer')}</Button>
        <Button variant="ghost" className="text-accent-foreground">
          {t('cancel')}
        </Button>
      </div>
    </div>
  );
};
