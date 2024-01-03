import { Ads } from '../../models';

export default {
  async ads(adWishlist: any, _args: any) {
    return Ads.find({ _id: { $in: adWishlist.adIds } });
  }
};
