import { IContext } from "../../connectionResolver";
import { IActivityLogDocument } from "../../db/models/definitions/activityLogs";
import { getContentTypeDetail } from "../../messageBroker";

export default {
  async createdUser(activityLog: IActivityLogDocument) {
    return (
      activityLog.createdBy && {
        __typename: "User",
        _id: activityLog.createdBy
      }
    );
  },

  async contentTypeDetail(
    activityLog: IActivityLogDocument,
    _,
    { subdomain }: IContext
  ) {
    return getContentTypeDetail(subdomain, activityLog);
  }
};
