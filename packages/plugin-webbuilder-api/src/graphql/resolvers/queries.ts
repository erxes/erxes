import { paginate } from '@erxes/api-utils/src';
import { escapeRegExp } from '@erxes/api-utils/src/core';
import {
  moduleRequireLogin,
  checkPermission,
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';
import fetch from 'node-fetch';

const generateCommonFilter = ({
  searchValue,
  siteId,
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
  async webbuilderPagesMain(
    _root,
    {
      page,
      perPage,
      searchValue,
      siteId,
    }: { page: number; perPage: number; searchValue: string; siteId: string },
    { models }: IContext,
  ) {
    const filter = generateCommonFilter({ searchValue, siteId });

    return {
      list: await paginate(models.Pages.find(filter), {
        page,
        perPage,
      }),
      totalCount: await models.Pages.find(filter).countDocuments(),
    };
  },

  async webbuilderPageDetail(_root, { _id }, { models }: IContext) {
    return models.Pages.findOne({ _id });
  },

  async webbuilderContentTypes(
    _root,
    { siteId }: { siteId: string },
    { models }: IContext,
  ) {
    const filter: any = {};

    if (siteId) {
      filter.siteId = siteId;
    }

    return models.ContentTypes.find(filter).sort({ displayName: 1 });
  },

  async webbuilderContentTypesMain(
    _root,
    {
      page,
      perPage,
      siteId,
    }: { page: number; perPage: number; siteId: string },
    { models }: IContext,
  ) {
    const filter = generateCommonFilter({ siteId });

    return {
      list: await paginate(
        models.ContentTypes.find(filter).sort({ displayName: 1 }),
        {
          page,
          perPage,
        },
      ),
      totalCount: await models.ContentTypes.find(filter).countDocuments(),
    };
  },

  async webbuilderContentTypeDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.ContentTypes.findOne({ _id });
  },

  async webbuilderEntriesMain(
    _root,
    {
      contentTypeId,
      page,
      perPage,
    }: { contentTypeId: string; page: number; perPage: number },
    { models }: IContext,
  ) {
    return {
      list: await paginate(models.Entries.find({ contentTypeId }), { page, perPage }),
      totalCount: await models.Entries.find({ contentTypeId }).countDocuments(),
    };
  },

  async webbuilderEntryDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Entries.findOne({ _id });
  },

  async webbuilderTemplates(_root, { searchValue }: { searchValue: string }) {
    return await fetch(
      `https://helper.erxes.io/get-webbuilder-templates?searchValue=${searchValue}`,
    ).then((res) => res.json());
  },

  async webbuilderTemplatesTotalCount(_root, _args, { models }: IContext) {
    return models.Templates.find().countDocuments();
  },

  async webbuilderTemplateDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.Templates.findOne({ _id });
  },

  async webbuilderSites(
    _root,
    {
      page,
      perPage,
      searchValue,
      fromSelect,
    }: {
      page: number;
      perPage: number;
      searchValue: string;
      fromSelect: boolean;
    },
    { models }: IContext,
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
      perPage,
    });
  },

  async webbuilderSitesTotalCount(_root, _args, { models }: IContext) {
    return models.Sites.find().countDocuments();
  },
};

moduleRequireLogin(webbuilderQueries);

checkPermission(webbuilderQueries, 'webbuilderPagesMain', 'showWebbuilder');
checkPermission(webbuilderQueries, 'webbuilderPageDetail', 'showWebbuilder');

checkPermission(webbuilderQueries, 'webbuilderContentTypes', 'showWebbuilder');
checkPermission(
  webbuilderQueries,
  'webbuilderContentTypesMain',
  'showWebbuilder',
);
checkPermission(
  webbuilderQueries,
  'webbuilderContentTypeDetail',
  'showWebbuilder',
);

checkPermission(webbuilderQueries, 'webbuilderEntriesMain', 'showWebbuilder');
checkPermission(webbuilderQueries, 'webbuilderEntryDetail', 'showWebbuilder');

checkPermission(webbuilderQueries, 'webbuilderTemplates', 'showWebbuilder');
checkPermission(
  webbuilderQueries,
  'webbuilderTemplatesTotalCount',
  'showWebbuilder',
);
checkPermission(
  webbuilderQueries,
  'webbuilderTemplateDetail',
  'showWebbuilder',
);

checkPermission(webbuilderQueries, 'webbuilderSites', 'showWebbuilder');
checkPermission(
  webbuilderQueries,
  'webbuilderSitesTotalCount',
  'showWebbuilder',
);

export default webbuilderQueries;
