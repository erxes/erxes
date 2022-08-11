import { paginate } from '@erxes/api-utils/src';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';

const webbuilderQueries = {
  webbuilderPages(
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

    return paginate(models.Pages.find(filter).sort({ name: 1 }), {
      page,
      perPage
    });
  },

  webbuilderPagesTotalCount(_root, _args, { models }: IContext) {
    return models.Pages.find({}).count();
  },

  webbuilderPageDetail(_root, { _id }, { models }: IContext) {
    return models.Pages.findOne({ _id });
  },

  webbuilderContentTypes(_root, args, { models }: IContext) {
    return paginate(
      models.ContentTypes.find({}).sort({ displayName: 1 }),
      args
    );
  },

  webbuilderContentTypesTotalCount(_root, _args, { models }: IContext) {
    return models.ContentTypes.find({}).count();
  },

  webbuilderContentTypeDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.ContentTypes.findOne({ _id });
  },

  webbuilderEntries(
    _root,
    {
      contentTypeId,
      page,
      perPage
    }: { contentTypeId: string; page: number; perPage: number },
    { models }: IContext
  ) {
    return paginate(models.Entries.find({ contentTypeId }), { page, perPage });
  },

  webbuilderEntriesTotalCount(
    _root,
    { contentTypeId }: { contentTypeId: string },
    { models }: IContext
  ) {
    return models.Entries.find({ contentTypeId }).count();
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
