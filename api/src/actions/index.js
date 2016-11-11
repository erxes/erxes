import ChatActions from './chat';
import CustomerActions from './customer';
import { store } from '../template.js';


export const Chat = ChatActions;
export const Customer = CustomerActions;

export function collectionItemAdded({ collection, _id, fields }) {
  if (collection === 'ticket_comments') {
    store.dispatch({
      ...fields,
      _id,
      type: 'MESSAGE_RECEIVED',
    });
  } else if (collection === 'users') {
    store.dispatch({
      ...fields,
      _id,
      type: 'USER_RECEIVED',
    });
  } else if (collection === 'customers') {
    store.dispatch({
      ...fields,
      _id,
      type: 'CUSTOMER_RECEIVED',
    });
  }
}

export function collectionItemChanged({ collection, _id, fields, cleared }) {
  if (collection === 'ticket_comments') {
    store.dispatch({
      fields,
      cleared,
      _id,
      type: 'MESSAGE_CHANGED',
    });
  } else if (collection === 'users') {
    store.dispatch({
      fields,
      cleared,
      _id,
      type: 'USER_CHANGED',
    });
  } else if (collection === 'customers') {
    store.dispatch({
      fields,
      cleared,
      _id,
      type: 'CUSTOMER_CHANGED',
    });
  }
}
