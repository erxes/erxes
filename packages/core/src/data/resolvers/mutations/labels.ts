import { IContext } from "../../../connectionResolver";
import { DEFAULT_LABELS } from "../../constants";

const labelMutations = {
  async saveLabel(_root: any, doc: any, { models, user }: IContext) {
    const defaultLabel = DEFAULT_LABELS[doc.forType];

    if (!defaultLabel) {
      throw new Error("Wrong forType");
    }

    const label = defaultLabel.find(
      (label) => label.name.toLowerCase() === doc.name.toLowerCase()
    );

    if (label) {
      throw new Error("You can't create a label with the same name");
    }

    return models.Labels.saveLabel(doc, user);
  },

  async removeLabel(_root: any, { name }: any, { models }: IContext) {
    return models.Labels.removeLabel(name);
  },
};

export default labelMutations;
