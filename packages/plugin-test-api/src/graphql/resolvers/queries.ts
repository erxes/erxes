import { IContext } from '../../connectionResolver';

const templateQueries = {
  tests(
    _root,
    {
      typeId,
      searchValue,
      testIds
    }: { typeId: string; searchValue?: string; testIds?: string[] },
    { models, commonQuerySelector }: IContext
  ) {
    const selector: any = { ...commonQuerySelector };
    console.log(typeId);
    if (typeId) {
      selector.typeId = typeId;
    }

    if (searchValue) {
      console.log('asdasd', searchValue);
      selector.name = new RegExp(`.*${searchValue}.*`, 'i');
    }
    console.log(testIds);
    if (testIds) {
      selector._id = { $in: testIds };
    }

    // return models.Templates.find({});
    return models.Templates.find(selector).sort({ order: 1, name: 1 });
  },

  types(_root, _args, { models }: IContext) {
    return models.Types.find({});
  },

  testsTotalCount(_root, _args, { models }: IContext) {
    return models.Templates.find({}).countDocuments();
  }
};

export default templateQueries;
