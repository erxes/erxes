import { IContext } from "../../../connectionResolver";
import { IContactLabel } from "../../../db/models/definitions/contactLabels";

const contactLabelMutations = {
  async saveContactLabel(
    _root: undefined,
    doc: IContactLabel,
    { models, user }: IContext
  ) {
    return models.ContactLabels.saveContactLabel(
      { ...doc, name: doc.name.toLowerCase() },
      user
    );
  },

  async removeContactLabel(
    _root: undefined,
    { name }: { name: string },
    { models }: IContext
  ) {
    return models.ContactLabels.removeContactLabel(name);
  },
};

export default contactLabelMutations;
