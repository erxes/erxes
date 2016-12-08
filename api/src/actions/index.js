import { store } from '../template';
import {
  CONVERSATION_RECEIVED,
  MESSAGE_RECEIVED,
  USER_RECEIVED,
  USER_CHANGED,
  NOTIFICATION_RECEIVED,
} from '../constants';


export function collectionItemAdded({ collection, _id, fields }) {
  if (collection === 'conversations') {
    store.dispatch({
      type: CONVERSATION_RECEIVED,
      conversation: { _id, ...fields },
    });
  }

  if (collection === 'conversation_messages') {
    store.dispatch({
      type: MESSAGE_RECEIVED,
      message: { _id, ...fields },
    });
  }

  if (collection === 'users') {
    store.dispatch({
      type: USER_RECEIVED,
      user: {
        _id,
        ...fields,
      },
    });
  }

  if (collection === 'counts') {
    store.dispatch({
      type: NOTIFICATION_RECEIVED,
      name: _id,
      count: fields.count,
    });
  }
}

export function collectionItemChanged({ collection, _id, fields, cleared }) {
  if (collection === 'users') {
    store.dispatch({
      type: USER_CHANGED,
      user: {
        _id,
        ...fields,
      },
      cleared,
    });
  }

  if (collection === 'counts') {
    store.dispatch({
      type: NOTIFICATION_RECEIVED,
      name: _id,
      count: fields.count,
    });
  }
}
