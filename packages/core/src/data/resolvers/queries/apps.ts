import { IContext } from "../../../connectionResolver";

export default {
  async apps(_root, _args, { models }: IContext) {
    return models.Apps.find().lean();
  },
  async appTotalCount(_root, _args, { models }: IContext) {
    return models.Apps.countDocuments();
  },
  async appDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Apps.findOne({ _id });
  }
}
