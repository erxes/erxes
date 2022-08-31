import { paginate } from '@erxes/api-utils/src';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';
import { writeAndReadHelpersData } from './utils';

const generateCommonFilter = ({
  searchValue,
  siteId
}: {
  searchValue?: string;
  siteId?: string;
}) => {
  let filter: any = {};

  if (searchValue) {
    filter.name = new RegExp(`.*${searchValue}.*`, 'i');
  }

  if (siteId) {
    filter.siteId = siteId;
  }

  return filter;
};

const webbuilderQueries = {
  webbuilderPagesMain(
    _root,
    {
      page,
      perPage,
      searchValue,
      siteId
    }: { page: number; perPage: number; searchValue: string; siteId: string },
    { models }: IContext
  ) {
    const filter = generateCommonFilter({ searchValue, siteId });

    return {
      list: paginate(models.Pages.find(filter), {
        page,
        perPage
      }),
      totalCount: models.Pages.find(filter).count()
    };
  },

  webbuilderPageDetail(_root, { _id }, { models }: IContext) {
    return models.Pages.findOne({ _id });
  },

  webbuilderContentTypes(
    _root,
    { siteId }: { siteId: string },
    { models }: IContext
  ) {
    let filter: any = {};

    if (siteId) {
      filter.siteId = siteId;
    }

    return models.ContentTypes.find(filter).sort({ displayName: 1 });
  },

  webbuilderContentTypesMain(
    _root,
    {
      page,
      perPage,
      siteId
    }: { page: number; perPage: number; siteId: string },
    { models }: IContext
  ) {
    const filter = generateCommonFilter({ siteId });

    return {
      list: paginate(
        models.ContentTypes.find(filter).sort({ displayName: 1 }),
        {
          page,
          perPage
        }
      ),
      totalCount: models.ContentTypes.find(filter).count()
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

  async webbuilderTemplates(_root, _args) {
    return writeAndReadHelpersData('templates');
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

  webbuilderSites(
    _root,
    {
      page,
      perPage,
      fromSelect
    }: { page: number; perPage: number; fromSelect: boolean },
    { models }: IContext
  ) {
    if (fromSelect) {
      return models.Sites.find().lean();
    }

    return paginate(models.Sites.find({}).sort({ name: 1 }), { page, perPage });
  },

  webbuilderSitesTotalCount(_root, _args, { models }: IContext) {
    return models.Sites.find().count();
  }
};

moduleRequireLogin(webbuilderQueries);

export default webbuilderQueries;
