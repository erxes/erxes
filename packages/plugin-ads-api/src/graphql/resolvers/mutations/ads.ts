import { IContext } from '../../../connectionResolver';

const adsMutations = {
  adReviewAdd: async (_root, params, { models: { AdReview } }: IContext) => {
    const { adId, review } = params;
    const added = await AdReview.createAdReview({ adId, review });
    return added;
  }
};

export default adsMutations;
