import { IImportHistoryDocument } from 'src/db/models/definitions/importHistory';

export default {
  user(history: IImportHistoryDocument) {
    return (
      history.userId && {
        __typename: 'User',
        _id: history.userId
      }
    );
  }
};
