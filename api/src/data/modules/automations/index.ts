import { receiveRpcMessageDeals } from './deals';
import { receiveRpcMessageTasks } from './tasks';

export const receiveRpcMessage = async msg => {
  const { module, action, payload } = msg;
  const doc = JSON.parse(payload || '{}');
  switch (module) {
    case 'deal':
      return receiveRpcMessageDeals(action, doc);
    case 'task':
      return receiveRpcMessageTasks(action, doc);
  }

  return;
};
