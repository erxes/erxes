import ChatActions from './chat';
import CustomerActions from './customer';
import { store } from '../template.js';


export const Chat = ChatActions;
export const Customer = CustomerActions;

export function collectionItemAdded({ collection, _id, fields }) {
  if (collection === 'tickets') {
    store.dispatch({
      ...fields,
      _id,
      type: 'CONVERSATION_RECEIVED',
    });
  } else if (collection === 'ticket_comments') {
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
  } else if (collection === 'counts') {
    store.dispatch({
      type: 'COUNT_RECEIVED',
      name: _id,
      count: fields.count,
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
  } else if (collection === 'counts') {
    store.dispatch({
      type: 'COUNT_RECEIVED',
      name: _id,
      count: fields.count,
    });
  }
}
