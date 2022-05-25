import {
  IStaticRoute,
  IStaticRouteDocument
} from './../../../models/definitions/staticRoutes';
import { IContext } from '../../../connectionResolver';

interface IStaticRouteEdit extends IStaticRoute {
  _id: string;
}

const staticRouteMutations = {
  staticRoutesAdd: async (_root, doc: IStaticRoute, { models }: IContext) => {
    return models.StaticRoutes.create(doc);
  }
};

export default staticRouteMutations;
