import { IContext } from '../../../connectionResolver';

const adMutations = {
  async activeAdd(_root, doc, { user, docModifier, models }: IContext) {
    const ad = await models.ActiveDirectory.createAD(doc, user);

    return ad;
  },
};

export default adMutations;
