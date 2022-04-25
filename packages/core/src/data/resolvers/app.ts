import { UsersGroups } from '../../db/models/Permissions';
import { IAppDocument } from "../..//db/models/definitions/apps";

export default {
  async userGroupName(app: IAppDocument) {
    const group = await UsersGroups.findOne({ _id: app.userGroupId });

    return group ? group.name : 'User group not found';
  }
}
