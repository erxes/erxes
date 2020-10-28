import { Users } from '../../db/models';
import { IImportHistoryDocument } from '../../db/models/definitions/importHistory';

export default {
  user(history: IImportHistoryDocument) {
    return Users.findOne({ _id: history.userId });
  }
};
