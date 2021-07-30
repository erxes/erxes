import { receiveRpcMessageDeals } from './deals';
import { receiveRpcMessagePerformMath } from './performMath';
import { receiveRpcMessageTasks } from './tasks';
import { receiveRpcMessageTickets } from './tickets';

export const receiveRpcMessage = async msg => {
  const { module, action, payload } = msg;
  const doc = JSON.parse(payload || '{}');
  switch (module) {
    case 'deal':
      return receiveRpcMessageDeals(action, doc);
    case 'task':
      return receiveRpcMessageTasks(action, doc);
    case 'ticket':
      return receiveRpcMessageTickets(action, doc);
    case 'performMath':
      return receiveRpcMessagePerformMath(doc);
  }

  return;
};
