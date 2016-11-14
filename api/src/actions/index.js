import ChatActions from './chat';
import { store } from '../template.js';


export const Chat = ChatActions;

export function collectionItemAdded({ collection, _id, fields }) {
  if (collection === 'tickets') {
    store.dispatch({
      ...fields,
      _id,
      type: 'CONVERSATION_RECEIVED',
    });
  }

  if (collection === 'ticket_comments') {
    console.log(fields);
    store.dispatch({
      ...fields,
      _id,
      type: 'MESSAGE_RECEIVED',
    });
  }

  if (collection === 'users') {
    store.dispatch({
      ...fields,
      _id,
      type: 'USER_RECEIVED',
    });
  }

  if (collection === 'counts') {
    store.dispatch({
      type: 'COUNT_RECEIVED',
      name: _id,
      count: fields.count,
    });
  }
}

export function collectionItemChanged({ collection, _id, fields, cleared }) {
  if (collection === 'users') {
    store.dispatch({
      fields,
      cleared,
      _id,
      type: 'USER_CHANGED',
    });
  }

  if (collection === 'counts') {
    store.dispatch({
      type: 'COUNT_RECEIVED',
      name: _id,
      count: fields.count,
    });
  }
}
