import { receiveRpcMessageBoardItem } from './boardItems';
// import { receiveRpcMessageDeals } from './deals';
// import { receiveRpcMessageTasks } from './tasks';
// import { receiveRpcMessageTickets } from './tickets';

export const receiveRpcMessage = async msg => {
  const { action, payload } = msg;

  const doc = JSON.parse(payload || '{}');

  return receiveRpcMessageBoardItem(action, doc);
};
