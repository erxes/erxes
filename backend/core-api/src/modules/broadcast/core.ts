import { InterMessage, isEnabled } from 'erxes-api-shared/utils';
import * as messageBroker from './messageBroker';

export interface MessageArgs extends MessageArgsOmitService {
  serviceName: string;
}

export interface MessageArgsOmitService extends InterMessage {
  action: string;
  isRPC?: boolean;
  isMQ?: boolean;
}

export const sendMessage = async (args: MessageArgs): Promise<any> => {
  const {
    serviceName,
    subdomain,
    action,
    data,
    defaultValue,
    isRPC,
    isMQ,
    timeout,
  } = args;

  if (serviceName && !(await isEnabled(serviceName))) {
    if (isRPC && defaultValue === undefined) {
      throw new Error(`${serviceName} service is not enabled`);
    } else {
      return defaultValue;
    }
  }

  const queueName = serviceName + (serviceName ? ':' : '') + action;

  return messageBroker[
    isRPC ? (isMQ ? 'sendRPCMessageMq' : 'sendRPCMessage') : 'sendMessage'
  ](queueName, {
    subdomain,
    data,
    defaultValue,
    timeout,
    thirdService: data && data.thirdService,
  });
};
