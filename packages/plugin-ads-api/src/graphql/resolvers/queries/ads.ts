import { IContext } from '../../../connectionResolver';

const adsQueries = {
  adReview: async (_root, params, { models: { AdReview } }: IContext) => {
    const { adId } = params;
    return AdReview.getAdReview(adId);
  },

  adReviews: async (_root, _params, { models: { AdReview } }: IContext) => {
    return AdReview.find({}).lean();
  }
};

export default adsQueries;
