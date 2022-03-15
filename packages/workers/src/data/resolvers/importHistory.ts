import { IImportHistoryDocument } from 'src/db/models/definitions/importHistory';

export default {
  user(_history: IImportHistoryDocument) {
    return '123213';
    // getDocument('users', { _id: history.userId });
  }
};
