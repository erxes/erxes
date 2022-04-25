import { IContext } from "../../../connectionResolver";

export default {
  apps(_root, _args, { models }: IContext) {
    return models.Apps.find().lean();
  },
  appTotalCount(_root, _args, { models }: IContext) {
    return models.Apps.countDocuments();
  }
}
