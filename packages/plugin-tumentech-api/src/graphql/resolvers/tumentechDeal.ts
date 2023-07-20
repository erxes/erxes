import { IContext } from '../../connectionResolver';
import { ITumentechDeal } from '../../models/definitions/tumentechDeal';

const TumentechDeal = {
  async deal(tumentechDeal: ITumentechDeal, _params) {
    const { dealId } = tumentechDeal;
    if (!dealId) {
      return null;
    }

    return {
      __typename: 'Deal',
      _id: dealId
    };
  },

  async startPlace(
    tumentechDeal: ITumentechDeal,
    _params,
    { models: { Places } }: IContext
  ) {
    const { startPlaceId } = tumentechDeal;

    if (!startPlaceId) {
      return null;
    }

    return Places.getPlace({ _id: startPlaceId });
  },

  async endPlace(
    tumentechDeal: ITumentechDeal,
    _params,
    { models: { Places } }: IContext
  ) {
    const { endPlaceId } = tumentechDeal;

    if (!endPlaceId) {
      return null;
    }

    return Places.getPlace({ _id: endPlaceId });
  }
};

export { TumentechDeal };
