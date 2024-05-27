import { IContext } from '../../connectionResolver';
import { IDealPlaceDocument } from '../../models/definitions/dealPlaces';

const DealPlace = {
  async startPlace(
    dealPlace: IDealPlaceDocument,
    _params,
    { models: { Places } }: IContext
  ) {
    return Places.getPlace({ _id: dealPlace.startPlaceId });
  },

  async endPlace(
    dealPlace: IDealPlaceDocument,
    _params,
    { models: { Places } }: IContext
  ) {
    return Places.getPlace({ _id: dealPlace.endPlaceId });
  }
};

export { DealPlace };
