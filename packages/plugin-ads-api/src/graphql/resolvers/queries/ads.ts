import { IContext } from '../../../connectionResolver';

const adsQueries = {
  adReview: async (_root, params, { models: { AdReview } }: IContext) => {
    const { adId } = params;
    return AdReview.getAdReview(adId);
  }
};

export default adsQueries;
