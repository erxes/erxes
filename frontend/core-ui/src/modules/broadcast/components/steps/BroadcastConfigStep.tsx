import { useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { BroadcastEmailMethod } from '../methods/BroadcastEmailMethod';
import { BroadcastMessengerMethod } from '../methods/BroadcastMessengerMethod';
import { BroadcastNotificationMethod } from '../methods/BroadcastNotificationMethod';
import { BroadcastWorkflowMethod } from '../methods/BroadcastWorkflowMethod';

const BROADCAST_CONFIG_METHOD = {
  email: BroadcastEmailMethod,
  messenger: BroadcastMessengerMethod,
  notification: BroadcastNotificationMethod,
  workflow: BroadcastWorkflowMethod,
};

type BROADCAST_CONFIG_METHOD_KEY = keyof typeof BROADCAST_CONFIG_METHOD;

export const BroadcastConfigStep = () => {
  const { t } = useTranslation('broadcasts');
  const [method] = useQueryState('method');

  if (!method) {
    return <div>{t('steps.no-method')}</div>;
  }

  const MethodContent =
    BROADCAST_CONFIG_METHOD[method as BROADCAST_CONFIG_METHOD_KEY];

  // Same guard as the preview: an unmapped method must not render `undefined`.
  if (!MethodContent) {
    return <div>{t('steps.nothing-to-configure')}</div>;
  }

  return <MethodContent />;
};
