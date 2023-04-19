import {
  moduleRequireLogin,
  checkPermission
} from '@erxes/api-utils/src/permissions';
import { IPage } from '../../models/definitions/pages';
import { IContentType } from '../../models/definitions/contentTypes';
import { IEntry } from '../../models/definitions/entries';
import { IContext } from '../../connectionResolver';
import { ITemplate } from '../../models/definitions/templates';
import { ISite } from '../../models/definitions/sites';
import { sendRequest } from '@erxes/api-utils/src';

interface IContentTypeEdit extends IContentType {
  _id: string;
}

interface IEntryEdit extends IEntry {
  _id: string;
}

const digitalIncomeRoomMutations = {
  async digitalIncomeRoomPagesAdd(
    _root,
    doc: IPage,
    { models, user }: IContext
  ) {
    return models.Pages.createPage(doc, user._id);
  },

  async digitalIncomeRoomPagesEdit(
    _root,
    args: { _id: string } & IPage,
    { models, user }: IContext
  ) {
    const { _id, ...doc } = args;

    return models.Pages.updatePage(_id, doc, user._id);
  },

  async digitalIncomeRoomPagesRemove(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.Pages.deleteOne({ _id });
  },

  async digitalIncomeRoomContentTypesAdd(
    _root,
    doc: IContentType,
    { models, user }: IContext
  ) {
    return models.ContentTypes.createContentType(doc, user._id);
  },

  async digitalIncomeRoomContentTypesEdit(
    _root,
    { _id, ...doc }: IContentTypeEdit,
    { models, user }: IContext
  ) {
    return models.ContentTypes.updateContentType(_id, doc, user._id);
  },

  async digitalIncomeRoomContentTypesRemove(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.ContentTypes.removeContentType(_id);
  },

  async digitalIncomeRoomEntriesAdd(
    _root,
    doc: IEntry,
    { models, user }: IContext
  ) {
    return models.Entries.createEntry(doc, user._id);
  },

  async digitalIncomeRoomEntriesEdit(
    _root,
    { _id, ...doc }: IEntryEdit,
    { models, user }: IContext
  ) {
    return models.Entries.updateEntry(_id, doc, user._id);
  },

  async digitalIncomeRoomEntriesRemove(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.Entries.removeEntry(_id);
  },

  async digitalIncomeRoomTemplatesAdd(
    _root,
    doc: ITemplate,
    { models }: IContext
  ) {
    return models.Templates.createTemplate(doc);
  },

  async digitalIncomeRoomTemplatesUse(
    _root,
    { _id, name, coverImage }: { _id: string; name: string; coverImage: any },
    { models, user }: IContext
  ) {
    const site = await models.Sites.createSite(
      {
        templateId: _id,
        name,
        coverImage
      },
      user._id
    );

    const { pages, contentTypes } = await sendRequest({
      url: `https://helper.erxes.io/get-webbuilder-template?templateId=${_id}`,
      method: 'get'
    });

    for (const page of pages) {
      await models.Pages.createPage(
        {
          ...page,
          _id: undefined,
          siteId: site._id
        },
        user._id
      );
    }

    for (const contentType of contentTypes) {
      const ct = await models.ContentTypes.createContentType(
        {
          ...contentType,
          _id: undefined,
          siteId: site._id
        },
        user._id
      );

      for (const entry of contentType.entries) {
        models.Entries.createEntry(
          {
            values: entry.values,
            contentTypeId: ct._id
          },
          user._id
        );
      }
    }

    return site._id;
  },

  async digitalIncomeRoomTemplatesRemove(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.Templates.deleteOne({ _id });
  },

  async digitalIncomeRoomSitesAdd(
    _root,
    doc: ISite,
    { models, user }: IContext
  ) {
    return models.Sites.createSite(doc, user._id);
  },

  async digitalIncomeRoomSitesEdit(
    _root,
    args: { _id: string } & ISite,
    { models, user }: IContext
  ) {
    const { _id, ...doc } = args;

    return models.Sites.updateSite(_id, doc, user._id);
  },

  async digitalIncomeRoomSitesRemove(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.Sites.removeSite(_id);
  },

  async digitalIncomeRoomSitesDuplicate(
    _root,
    { _id }: { _id: string },
    { models, user }: IContext
  ) {
    return models.Sites.duplicateSite(_id, user._id);
  }
};

moduleRequireLogin(digitalIncomeRoomMutations);

checkPermission(
  digitalIncomeRoomMutations,
  'digitalIncomeRoomPagesAdd',
  'managedigitalIncomeRoom'
);
checkPermission(
  digitalIncomeRoomMutations,
  'digitalIncomeRoomPagesEdit',
  'managedigitalIncomeRoom'
);
checkPermission(
  digitalIncomeRoomMutations,
  'digitalIncomeRoomPagesRemove',
  'managedigitalIncomeRoom'
);

checkPermission(
  digitalIncomeRoomMutations,
  'digitalIncomeRoomContentTypesAdd',
  'managedigitalIncomeRoom'
);
checkPermission(
  digitalIncomeRoomMutations,
  'digitalIncomeRoomContentTypesEdit',
  'managedigitalIncomeRoom'
);
checkPermission(
  digitalIncomeRoomMutations,
  'digitalIncomeRoomContentTypesRemove',
  'managedigitalIncomeRoom'
);

checkPermission(
  digitalIncomeRoomMutations,
  'digitalIncomeRoomEntriesAdd',
  'managedigitalIncomeRoom'
);
checkPermission(
  digitalIncomeRoomMutations,
  'digitalIncomeRoomEntriesEdit',
  'managedigitalIncomeRoom'
);
checkPermission(
  digitalIncomeRoomMutations,
  'digitalIncomeRoomEntriesRemove',
  'managedigitalIncomeRoom'
);

checkPermission(
  digitalIncomeRoomMutations,
  'digitalIncomeRoomTemplatesAdd',
  'managedigitalIncomeRoom'
);
checkPermission(
  digitalIncomeRoomMutations,
  'digitalIncomeRoomTemplatesUse',
  'managedigitalIncomeRoom'
);
checkPermission(
  digitalIncomeRoomMutations,
  'digitalIncomeRoomTemplatesRemove',
  'managedigitalIncomeRoom'
);

checkPermission(
  digitalIncomeRoomMutations,
  'digitalIncomeRoomSitesAdd',
  'managedigitalIncomeRoom'
);
checkPermission(
  digitalIncomeRoomMutations,
  'digitalIncomeRoomSitesEdit',
  'managedigitalIncomeRoom'
);
checkPermission(
  digitalIncomeRoomMutations,
  'digitalIncomeRoomSitesRemove',
  'managedigitalIncomeRoom'
);
checkPermission(
  digitalIncomeRoomMutations,
  'digitalIncomeRoomSitesDuplicate',
  'managedigitalIncomeRoom'
);

export default digitalIncomeRoomMutations;
