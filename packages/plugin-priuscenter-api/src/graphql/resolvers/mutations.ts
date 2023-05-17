import { Ads } from '../../models';

const adMutations = {
  /**
   * Creates a new ad
   */
  async adsAdd(_root, doc, { cpUser }) {
    if (!cpUser) {
      throw new Error('Permission denied');
    }

    doc.cpUserId = cpUser.userId;

    return Ads.createAd(doc);
  },

  /**
   * Edits a new ad
   */
  async adsEdit(_root, { _id, ...doc }, { cpUser }) {
    const ad = await Ads.getAd(_id);

    if (!cpUser || cpUser.userId !== ad.cpUserId) {
      throw new Error('Permission denied');
    }

    return Ads.updateAd(_id, doc);
  },

  /**
   * Removes a single ad
   */
  async adsRemove(_root, { _id }, { cpUser }) {
    const ad = await Ads.getAd(_id);

    if (!cpUser || cpUser.userId !== ad.cpUserId) {
      throw new Error('Permission denied');
    }

    return Ads.removeAd(_id);
  }
};

export default adMutations;
