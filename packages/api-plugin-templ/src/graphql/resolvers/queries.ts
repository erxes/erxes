import { IContext } from '../../connectionResolver';

const templateQueries = {
  {name}s(
    _root,
    {
      typeId,
      searchValue,
      {name}Ids
    }: { typeId: string; searchValue?: string; {name}Ids?: string[] },
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
    console.log({name}Ids);
    if ({name}Ids) {
      selector._id = { $in: {name}Ids };
    }

    // return models.Templates.find({});
    return models.Templates.find(selector).sort({ order: 1, name: 1 });
  },

  {name}Types(_root, _args, { models }: IContext) {
    return models.Types.find({});
  },

  {name}sTotalCount(_root, _args, { models }: IContext) {
    return models.Templates.find({}).countDocuments();
  }
};

export default templateQueries;
