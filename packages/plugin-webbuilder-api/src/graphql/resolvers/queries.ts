import { paginate, sendRequest } from '@erxes/api-utils/src';
import { escapeRegExp } from '@erxes/api-utils/src/core';
import {
  moduleRequireLogin,
  checkPermission
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';

const generateCommonFilter = ({
  searchValue,
  siteId
}: {
  searchValue?: string;
  siteId?: string;
}) => {
  const filter: any = {};

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
    const filter: any = {};

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

  async webbuilderTemplates(_root, { searchValue }: { searchValue: string }) {
    return sendRequest({
      url: `https://helper.erxes.io/get-webbuilder-templates?searchValue=${searchValue}`,
      method: 'get'
    });
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
      searchValue,
      fromSelect
    }: {
      page: number;
      perPage: number;
      searchValue: string;
      fromSelect: boolean;
    },
    { models }: IContext
  ) {
    const filter: any = {};

    if (fromSelect) {
      return models.Sites.find().lean();
    }

    if (searchValue) {
      filter.name = new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i');
    }

    return paginate(models.Sites.find(filter).sort({ name: 1 }), {
      page,
      perPage
    });
  },

  webbuilderSitesTotalCount(_root, _args, { models }: IContext) {
    return models.Sites.find().count();
  }
};

moduleRequireLogin(webbuilderQueries);

checkPermission(webbuilderQueries, 'webbuilderPagesMain', 'showWebbuilder');
checkPermission(webbuilderQueries, 'webbuilderPageDetail', 'showWebbuilder');

checkPermission(webbuilderQueries, 'webbuilderContentTypes', 'showWebbuilder');
checkPermission(
  webbuilderQueries,
  'webbuilderContentTypesMain',
  'showWebbuilder'
);
checkPermission(
  webbuilderQueries,
  'webbuilderContentTypeDetail',
  'showWebbuilder'
);

checkPermission(webbuilderQueries, 'webbuilderEntriesMain', 'showWebbuilder');
checkPermission(webbuilderQueries, 'webbuilderEntryDetail', 'showWebbuilder');

checkPermission(webbuilderQueries, 'webbuilderTemplates', 'showWebbuilder');
checkPermission(
  webbuilderQueries,
  'webbuilderTemplatesTotalCount',
  'showWebbuilder'
);
checkPermission(
  webbuilderQueries,
  'webbuilderTemplateDetail',
  'showWebbuilder'
);

checkPermission(webbuilderQueries, 'webbuilderSites', 'showWebbuilder');
checkPermission(
  webbuilderQueries,
  'webbuilderSitesTotalCount',
  'showWebbuilder'
);

export default webbuilderQueries;
