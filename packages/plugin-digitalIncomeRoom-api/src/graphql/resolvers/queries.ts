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

const digitalIncomeRoomQueries = {
  digitalIncomeRoomPagesMain(
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

  digitalIncomeRoomPageDetail(_root, { _id }, { models }: IContext) {
    return models.Pages.findOne({ _id });
  },

  digitalIncomeRoomContentTypes(
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
  digitalIncomeRoomContentTypesMain(
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
  digitalIncomeRoomContentTypeDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.ContentTypes.findOne({ _id });
  },
  digitalIncomeRoomEntriesMain(
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

  digitalIncomeRoomEntryDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.Entries.findOne({ _id });
  },

  async digitalIncomeRoomTemplates(
    _root,
    { searchValue }: { searchValue: string }
  ) {
    return sendRequest({
      url: `https://helper.erxes.io/get-webbuilder-templates?searchValue=${searchValue}`,
      method: 'get'
    });
  },

  digitalIncomeRoomTemplatesTotalCount(_root, _args, { models }: IContext) {
    return models.Templates.find().count();
  },

  digitalIncomeRoomTemplateDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.Templates.findOne({ _id });
  },

  digitalIncomeRoomSites(
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

  digitalIncomeRoomSitesTotalCount(_root, _args, { models }: IContext) {
    return models.Sites.find().count();
  }
};

moduleRequireLogin(digitalIncomeRoomQueries);

checkPermission(
  digitalIncomeRoomQueries,
  'digitalIncomeRoomPagesMain',
  'showdigitalIncomeRoom'
);
checkPermission(
  digitalIncomeRoomQueries,
  'digitalIncomeRoomPageDetail',
  'showdigitalIncomeRoom'
);

checkPermission(
  digitalIncomeRoomQueries,
  'digitalIncomeRoomContentTypes',
  'showdigitalIncomeRoom'
);
checkPermission(
  digitalIncomeRoomQueries,
  'digitalIncomeRoomContentTypesMain',
  'showdigitalIncomeRoom'
);
checkPermission(
  digitalIncomeRoomQueries,
  'digitalIncomeRoomContentTypeDetail',
  'showdigitalIncomeRoom'
);

checkPermission(
  digitalIncomeRoomQueries,
  'digitalIncomeRoomEntriesMain',
  'showdigitalIncomeRoom'
);
checkPermission(
  digitalIncomeRoomQueries,
  'digitalIncomeRoomEntryDetail',
  'showdigitalIncomeRoom'
);

checkPermission(
  digitalIncomeRoomQueries,
  'digitalIncomeRoomTemplates',
  'showdigitalIncomeRoom'
);
checkPermission(
  digitalIncomeRoomQueries,
  'digitalIncomeRoomTemplatesTotalCount',
  'showdigitalIncomeRoom'
);
checkPermission(
  digitalIncomeRoomQueries,
  'digitalIncomeRoomTemplateDetail',
  'showdigitalIncomeRoom'
);

checkPermission(
  digitalIncomeRoomQueries,
  'digitalIncomeRoomSites',
  'showdigitalIncomeRoom'
);
checkPermission(
  digitalIncomeRoomQueries,
  'digitalIncomeRoomSitesTotalCount',
  'showdigitalIncomeRoom'
);

export default digitalIncomeRoomQueries;
