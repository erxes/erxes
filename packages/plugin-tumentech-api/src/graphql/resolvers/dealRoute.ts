import { IContext } from '../../connectionResolver';
import { IDealRouteDocument } from '../../models/definitions/dealRoutes';

const DealRoute = {
  async route(
    dealRoute: IDealRouteDocument,
    _params,
    { models: { Routes } }: IContext
  ) {
    return Routes.getRoute({ _id: dealRoute.routeId });
  }
};

export { DealRoute };
