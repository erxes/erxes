import { useQueryState } from 'erxes-ui';
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
  const [method] = useQueryState('method');

  if (!method) {
    return <div>Method not found, Try to refresh the page</div>;
  }

  const MethodContent = BROADCAST_CONFIG_METHOD[method as BROADCAST_CONFIG_METHOD_KEY];

  return <MethodContent />;
};
