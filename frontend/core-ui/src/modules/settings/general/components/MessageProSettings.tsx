import { useConfig } from '@/settings/file-upload/hook/useConfigs';
import { Button, Input, Label, Spinner } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const MESSAGE_PRO_API_KEY = 'MESSAGE_PRO_API_KEY';
const MESSAGE_PRO_PHONE_NUMBER = 'MESSAGE_PRO_PHONE_NUMBER';

export const MessageProSettings = () => {
  const { configs, updateConfig, isLoading } = useConfig();
  const { t } = useTranslation('settings', { keyPrefix: 'general' });

  const [apiKey, setApiKey] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    if (!configs) return;

    const findValue = (code: string) =>
      configs.find((config: any) => config.code === code)?.value || '';

    setApiKey(findValue(MESSAGE_PRO_API_KEY));
    setPhoneNumber(findValue(MESSAGE_PRO_PHONE_NUMBER));
  }, [configs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      [MESSAGE_PRO_API_KEY]: apiKey,
      [MESSAGE_PRO_PHONE_NUMBER]: phoneNumber,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="py-1 flex flex-col space-y-3">
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor={MESSAGE_PRO_API_KEY}>
          {t('messageProApiKey', 'Message Pro API key')}
        </Label>
        <Input
          id={MESSAGE_PRO_API_KEY}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="API key"
        />
      </div>
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor={MESSAGE_PRO_PHONE_NUMBER}>
          {t('messageProPhoneNumber', 'Message Pro phone number')}
        </Label>
        <Input
          id={MESSAGE_PRO_PHONE_NUMBER}
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Phone number"
        />
      </div>
      <Button disabled={isLoading} type="submit" className="w-1/4 ml-auto">
        {isLoading ? (
          <Spinner className="stroke-white/90 w-4 h-4" />
        ) : (
          t('update')
        )}
      </Button>
    </form>
  );
};
