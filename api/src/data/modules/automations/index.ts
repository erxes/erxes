import { receiveRpcMessageDeals } from './deals';
import { receiveRpcMessageTasks } from './tasks';

export const receiveRpcMessage = async msg => {
  const { module, action, payload } = msg;
  const doc = JSON.parse(payload || '{}');
  switch (module) {
    case 'deal':
      receiveRpcMessageDeals(action, doc);
      break;
    case 'task':
      receiveRpcMessageTasks(action, doc);
      break;
  }
};
