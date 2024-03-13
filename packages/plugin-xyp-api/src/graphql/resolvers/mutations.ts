import { IContext } from '../../connectionResolver';
import { convertToPropertyData } from '../../utils';

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
    return models.XypData.updateXypData(_id, doc, user);
  },
  /**
   * Removes a single xyp
   */
  async xypDataRemove(_root, { _id }, { models, user }: IContext) {
    return models.XypData.removeXypData(_id);
  },
  async xypDataCreateOrUpdate(_root, { ...doc }, { models, user }: IContext) {
    return models.XypData.createOrUpdateXypData(doc);
  },
  async xypConvertToCustomeFields(
    _root,
    { _id },
    { models, user, subdomain }: IContext,
  ) {
    return await convertToPropertyData(models, subdomain, { customerId: _id });
  },
};

export default xypMutations;
