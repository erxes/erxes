import { IAppDocument } from "../../db/models/definitions/apps";
import { IContext } from "../../connectionResolver";

export default {
  async userGroupName(app: IAppDocument, _args, { models }: IContext) {
    const group = await models.UsersGroups.findOne({ _id: app.userGroupId });

    return group ? group.name : 'User group not found';
  }
}
