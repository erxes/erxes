import { useCallUserIntegration } from '@/integrations/call/hooks/useCallUserIntegration';
import { callConfigAtom } from '@/integrations/call/states/sipStates';
import { Label, Select, formatPhoneNumber } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

export const SelectPhoneCallFrom = () => {
  const { t } = useTranslation('frontline');
  const { callUserIntegrations } = useCallUserIntegration();
  const [callConfig, setCallConfig] = useAtom(callConfigAtom);

  const handleSelectPhone = (phone: string) => {
    const selectedIntegration = callUserIntegrations?.find(
      (integration) => integration.phone === phone,
    );
    if (!selectedIntegration) {
      return;
    }
    setCallConfig({ ...selectedIntegration, isAvailable: true });
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="call-from">{t('call-from')}</Label>
      <Select value={callConfig?.phone} onValueChange={handleSelectPhone}>
        <Select.Trigger id="call-from" type="button">
          <Select.Value placeholder={t('select-a-phone')} />
        </Select.Trigger>
        <Select.Content>
          {callUserIntegrations?.map((integration) => (
            <Select.Item key={integration._id} value={integration.phone}>
              {formatPhoneNumber({
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
