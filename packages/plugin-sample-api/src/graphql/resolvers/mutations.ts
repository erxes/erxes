import { IContext } from "../../connectionResolver";
import { ISample, ISampleDocument } from "../../models/definitions/sample";
import { IType, ITypeDocument } from "../../models/definitions/type";


const sampleMutations = {
  /**
   * Creates a new sample
   */
  async samplesAdd(_root, doc: ISample, { user, models }: IContext) {
    return models.Samples.createSample(doc, user);
  },
  /**
   * Edits a new sample
   */
  async samplesEdit(
    _root,
    { _id, ...doc }: ISampleDocument,
    { models }: IContext
  ) {
    return models.Samples.updateSample(_id, doc);
  },
  /**
   * Removes a single sample
   */
  async samplesRemove(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Samples.removeSample(_id);
  },

  /**
   * Creates a new type for sample
   */
  async sampleTypesAdd(_root, doc: IType, { models }: IContext) {
    return models.Types.createType(doc);
  },

  async sampleTypesRemove(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Types.removeType(_id);
  },

  async sampleTypesEdit(
    _root,
    { _id, ...doc }: ITypeDocument,
    { models }: IContext
  ) {
    return models.Types.updateType(_id, doc);
  }
};

export default sampleMutations;
