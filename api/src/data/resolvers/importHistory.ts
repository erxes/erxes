import { IImportHistoryDocument } from '../../db/models/definitions/importHistory';
import { getDocument } from './mutations/cacheUtils';

export default {
  user(history: IImportHistoryDocument) {
    return getDocument('users', { _id: history.userId });
  }
};
