import { Ads, AdWishlists } from '../../models';

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
  },

  /**
   * Add a single ad to wishlist
   */

  async adWishlistAdd(_root, { _id, ...doc }, { cpUser }) {
    if (!cpUser) {
      throw new Error('Login required');
    }
    const ads = await AdWishlists.getAdWishlist(cpUser.userId);

    if (ads) {
      const adIds = ads.adIds;
      if (adIds.includes(_id)) {
        throw new Error('Ad already in wishlist');
      }
      adIds.push(_id);
      await AdWishlists.updateOne(
        { cpUserId: cpUser.userId },
        { $set: { adIds } }
      );

      return AdWishlists.getAdWishlist(cpUser.userId);
    }

    doc.cpUserId = cpUser.userId;
    doc.adIds = [_id];
    return AdWishlists.createAdWishlist(doc);
  },

  /**
   * Removes a single ad from wishlist
   */

  async adWishlistRemove(_root, { _id, ...doc }, { cpUser }) {
    if (!cpUser || !cpUser.userId) {
      throw new Error('Login required');
    }

    const ads = await AdWishlists.getAdWishlist(cpUser.userId);
    const adIds = ads.adIds;

    if (!adIds.includes(_id)) {
      throw new Error('Ad not in wishlist');
    }

    const index = adIds.indexOf(_id);
    if (index > -1) {
      adIds.splice(index, 1);
    }
    await AdWishlists.updateOne(
      { cpUserId: cpUser.userId },
      { $set: { adIds } }
    );

    return AdWishlists.getAdWishlist(cpUser.userId);
  }
};

export default adMutations;
