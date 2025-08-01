import { IContext } from "../../../connectionResolver";
import { ILabel } from "../../../db/models/definitions/labels";

const labelMutations = {
  async saveLabel(_root: undefined, doc: ILabel, { models, user }: IContext) {
    return models.Labels.saveLabel(
      { ...doc, name: doc.name.toLowerCase() },
      user
    );
  },

  async removeLabel(
    _root: undefined,
    { name }: { name: string },
    { models }: IContext
  ) {
    return models.Labels.removeLabel(name);
  },
};

export default labelMutations;
