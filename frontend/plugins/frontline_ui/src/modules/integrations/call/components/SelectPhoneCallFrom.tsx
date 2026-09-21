import { useCallEnabledIntegrations } from '@/integrations/call/hooks/useCallEnabledIntegrations';
import { callConfigAtom } from '@/integrations/call/states/sipStates';
import { Label, Select, formatPhoneNumber } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';

export const SelectPhoneCallFrom = () => {
  const { t } = useTranslation('frontline');
  const { enabledIntegrations, selectCallFrom } = useCallEnabledIntegrations();
  const callConfig = useAtomValue(callConfigAtom);

  return (
    <div className="space-y-2">
      <Label htmlFor="call-from">{t('call-from')}</Label>
      <Select
        value={callConfig?.isAvailable ? callConfig.inboxId : ''}
        onValueChange={selectCallFrom}
      >
        <Select.Trigger id="call-from" type="button">
          <Select.Value placeholder={t('select-a-phone')} />
        </Select.Trigger>
        <Select.Content className="z-110">
          {enabledIntegrations.map((integration) => (
            <Select.Item key={integration._id} value={integration.inboxId}>
              {integration.name ||
                formatPhoneNumber({
                  value: integration.phone,
                  defaultCountry: 'MN',
                })}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </div>
  );
};
