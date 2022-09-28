import { IContext } from '../../connectionResolver';

const templateQueries = {
  tumentechs(
    _root,
    {
      typeId,
      searchValue,
      tumentechIds
    }: { typeId: string; searchValue?: string; tumentechIds?: string[] },
    { models, commonQuerySelector }: IContext
  ) {
    const selector: any = { ...commonQuerySelector };
    if (typeId) {
      selector.typeId = typeId;
    }

    if (searchValue) {
      selector.name = new RegExp(`.*${searchValue}.*`, 'i');
    }
    if (tumentechIds) {
      selector._id = { $in: tumentechIds };
    }

    // return models.Templates.find({});
    return models.Templates.find(selector).sort({ order: 1, name: 1 });
  },

  tumentechTypes(_root, _args, { models }: IContext) {
    return models.Types.find({});
  },

  tumentechsTotalCount(_root, _args, { models }: IContext) {
    return models.Templates.find({}).countDocuments();
  }
};

export default templateQueries;
