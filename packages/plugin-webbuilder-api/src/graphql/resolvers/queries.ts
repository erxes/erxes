import { paginate } from '@erxes/api-utils/src';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';

const webbuilderQueries = {
  webbuilderPagesMain(
    _root,
    {
      page,
      perPage,
      searchValue
    }: { page: number; perPage: number; searchValue: string },
    { models }: IContext
  ) {
    let filter: any = {};

    if (searchValue) {
      filter.name = new RegExp(`.*${searchValue}.*`, 'i');
    }

    return {
      list: paginate(models.Pages.find(filter).sort({ name: 1 }), {
        page,
        perPage
      }),
      totalCount: models.Pages.find({}).count()
    };
  },

  webbuilderPageDetail(_root, { _id }, { models }: IContext) {
    return models.Pages.findOne({ _id });
  },

  webbuilderContentTypes(_root, _args, { models }: IContext) {
    return models.ContentTypes.find({}).sort({ displayName: 1 });
  },

  webbuilderContentTypesMain(
    _root,
    args: { page: number; perPage: number },
    { models }: IContext
  ) {
    return {
      list: paginate(
        models.ContentTypes.find({}).sort({ displayName: 1 }),
        args
      ),
      totalCount: models.ContentTypes.find().count()
    };
  },

  webbuilderContentTypeDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.ContentTypes.findOne({ _id });
  },

  webbuilderEntriesMain(
    _root,
    {
      contentTypeId,
      page,
      perPage
    }: { contentTypeId: string; page: number; perPage: number },
    { models }: IContext
  ) {
    return {
      list: paginate(models.Entries.find({ contentTypeId }), { page, perPage }),
      totalCount: models.Entries.find({ contentTypeId }).count()
    };
  },

  webbuilderEntryDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Entries.findOne({ _id });
  },

  webbuilderTemplates(_root, args, { models }: IContext) {
    return paginate(models.Templates.find(), args);
  },

  webbuilderTemplatesTotalCount(_root, _args, { models }: IContext) {
    return models.Templates.find().count();
  },

  webbuilderTemplateDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.Templates.findOne({ _id });
  },

  webbuilderSites(_root, args, { models }: IContext) {
    return paginate(models.Sites.find({}).sort({ name: 1 }), args);
  },

  webbuilderSitesTotalCount(_root, _args, { models }: IContext) {
    return models.Sites.find().count();
  }
};

moduleRequireLogin(webbuilderQueries);

export default webbuilderQueries;
