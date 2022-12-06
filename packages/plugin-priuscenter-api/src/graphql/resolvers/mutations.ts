import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '@erxes/api-utils/src/types';
import { Ads } from '../../models';

const adMutations = {
  /**
   * Creates a new ad
   */
  async adsAdd(_root, doc, _context: IContext) {
    return Ads.createAd(doc);
  },
  /**
   * Edits a new ad
   */
  async adsEdit(_root, { _id, ...doc }, { user }: IContext) {
    await Ads.getAd(_id);

    doc.createdUserId = user._id;

    return Ads.updateAd(_id, doc);
  },
  /**
   * Removes a single ad
   */
  async adsRemove(_root, { _id }, _context: IContext) {
    return Ads.removeAd(_id);
  }
};

checkPermission(adMutations, 'adsAdd', 'priuscenterManageAds');
checkPermission(adMutations, 'adsEdit', 'priuscenterManageAds');
checkPermission(adMutations, 'adsRemove', 'priuscenterManageAds');

export default adMutations;
