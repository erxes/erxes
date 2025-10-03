import { IContext } from '~/connectionResolvers';
export const unitsMutations = {
async unitsAdd(_parent: undefined, doc, { user, models }: IContext) {
    const unit = await models.Units.createUnit(doc, user);

    return unit;
  },

  async unitsEdit(_parent: undefined, { _id, ...doc }, { user, models }: IContext) {
    const unit = await models.Units.updateUnit(_id, doc, user);

    return unit;
  },

  async unitsRemove(_parent: undefined, { ids }, { models }: IContext) {
    if (!ids.length) {
      throw new Error('You must specify at least one unit id to remove');
    }
    const deleteResponse = await models.Units.removeUnits(ids);

    return deleteResponse;
  },
};
