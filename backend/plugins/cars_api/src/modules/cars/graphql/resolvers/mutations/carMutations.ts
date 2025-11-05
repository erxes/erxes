import { requireLogin, checkPermission } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import { ICar, ICarDocument } from '~/modules/cars/@types/car';

export const carMutations = {
  carsAdd: async (_root: undefined, doc: ICar, { models }: IContext) => {
    return await models.Cars.carsAdd({ ...doc });
  },

  carsEdit: async (
    _root: undefined,
    { _id, ...doc }: ICarDocument,
    { models }: IContext,
  ) => {
    return await models.Cars.carsEdit(_id, doc);
  },

  carsRemove: async (
    _root: undefined,
    { carIds }: { carIds: string[] },
    { models }: IContext,
  ) => {
    return await models.Cars.carsRemove(carIds);
  },

  carsMerge: async (_root: undefined, { carIds, carFields }, { models }) => {
    return models.Cars.mergeCars(carIds, carFields);
  },
};

requireLogin(carMutations, 'manageCars');

checkPermission(carMutations, 'carsAdd', 'manageCars');
checkPermission(carMutations, 'carsEdit', 'manageCars');
checkPermission(carMutations, 'carsRemove', 'manageCars');
checkPermission(carMutations, 'carsMerge', 'manageCars');
