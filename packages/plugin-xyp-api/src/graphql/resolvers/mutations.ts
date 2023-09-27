// import { Xyps, Types } from '../../models';
import { IContext } from '../../connectionResolver';

const xypMutations = {
  /**
   * Creates a new xyp
   */
  async xypDataAdd(_root, doc, { models, user }: IContext) {
    return models.XypData.createXypData(doc, user);
  },
  /**
   * Edits a new xyp
   */
  async xypDataUpdate(_root, { _id, ...doc }, { models, user }: IContext) {
    // return Xyps.updateXyp(_id, doc);
    return models.XypData.updateXypData(_id, doc, user);
  },
  /**
   * Removes a single xyp
   */
  async xypDataRemove(_root, { _id }, { models, user }: IContext) {
    // return Xyps.removeXyp(_id);
    return models.XypData.removeXypData(_id);
  }
};

export default xypMutations;
