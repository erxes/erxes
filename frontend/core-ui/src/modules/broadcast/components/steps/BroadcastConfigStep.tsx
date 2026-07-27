import { useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { BroadcastEmailMethod } from '../methods/BroadcastEmailMethod';
import { BroadcastMessengerMethod } from '../methods/BroadcastMessengerMethod';
import { BroadcastNotificationMethod } from '../methods/BroadcastNotificationMethod';

const BROADCAST_CONFIG_METHOD = {
  email: BroadcastEmailMethod,
  messenger: BroadcastMessengerMethod,
  notification: BroadcastNotificationMethod,
};

type BROADCAST_CONFIG_METHOD_KEY = keyof typeof BROADCAST_CONFIG_METHOD;

export const BroadcastConfigStep = () => {
  const { t } = useTranslation('broadcasts');
  const [method] = useQueryState('method');

  if (!method) {
    return <div>{t('step.method-not-found', 'Method not found, Try to refresh the page')}</div>;
  }

  const MethodContent = BROADCAST_CONFIG_METHOD[method as BROADCAST_CONFIG_METHOD_KEY];

  return <MethodContent />;
};
