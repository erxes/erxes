import { receiveRpcMessageBoardItem } from './boardItems';
// import { receiveRpcMessageDeals } from './deals';
// import { receiveRpcMessageTasks } from './tasks';
// import { receiveRpcMessageTickets } from './tickets';

export const receiveRpcMessage = async msg => {
  const { module, action, payload } = msg;
  const doc = JSON.parse(payload || '{}');
  switch (module) {
    case 'deal':
      return receiveRpcMessageBoardItem(module, action, doc);
    case 'task':
      return receiveRpcMessageBoardItem(module, action, doc);
    case 'ticket':
      return receiveRpcMessageBoardItem(module, action, doc);
  }

  return;
};
