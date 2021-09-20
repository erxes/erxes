import { Exms } from '../../../db/models';
import { IContext } from '../../types';

const exmMutations = {
  async exmsAdd(_root, doc: any, { user }: IContext) {
    const exm = await Exms.createExm(doc, user);

    return exm;
  },

  async exmsEdit(_root, { _id, ...doc }: any) {
    const updated = await Exms.updateExm(_id, doc);

    return updated;
  },

  exmsRemove(_root, { _id }: { _id: string }) {
    return Exms.removeExm(_id);
  }
};

export default exmMutations;
