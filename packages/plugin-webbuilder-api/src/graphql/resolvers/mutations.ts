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

const webbuilderMutations = {
  async webbuilderPagesAdd(_root, doc: IPage, { models, user }: IContext) {
    return models.Pages.createPage(doc, user._id);
  },

  async webbuilderPagesEdit(
    _root,
    args: { _id: string } & IPage,
    { models, user }: IContext
  ) {
    const { _id, ...doc } = args;

    return models.Pages.updatePage(_id, doc, user._id);
  },

  async webbuilderPagesRemove(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.Pages.deleteOne({ _id });
  },

  async webbuilderContentTypesAdd(
    _root,
    doc: IContentType,
    { models, user }: IContext
  ) {
    return models.ContentTypes.createContentType(doc, user._id);
  },

  async webbuilderContentTypesEdit(
    _root,
    { _id, ...doc }: IContentTypeEdit,
    { models, user }: IContext
  ) {
    return models.ContentTypes.updateContentType(_id, doc, user._id);
  },

  async webbuilderContentTypesRemove(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.ContentTypes.removeContentType(_id);
  },

  async webbuilderEntriesAdd(_root, doc: IEntry, { models, user }: IContext) {
    return models.Entries.createEntry(doc, user._id);
  },

  async webbuilderEntriesEdit(
    _root,
    { _id, ...doc }: IEntryEdit,
    { models, user }: IContext
  ) {
    return models.Entries.updateEntry(_id, doc, user._id);
  },

  async webbuilderEntriesRemove(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.Entries.removeEntry(_id);
  },

  async webbuilderTemplatesAdd(_root, doc: ITemplate, { models }: IContext) {
    return models.Templates.createTemplate(doc);
  },

  async webbuilderTemplatesUse(
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

  async webbuilderTemplatesRemove(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.Templates.deleteOne({ _id });
  },

  async webbuilderSitesAdd(_root, doc: ISite, { models, user }: IContext) {
    return models.Sites.createSite(doc, user._id);
  },

  async webbuilderSitesEdit(
    _root,
    args: { _id: string } & ISite,
    { models, user }: IContext
  ) {
    const { _id, ...doc } = args;

    return models.Sites.updateSite(_id, doc, user._id);
  },

  async webbuilderSitesRemove(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.Sites.removeSite(_id);
  },

  async webbuilderSitesDuplicate(
    _root,
    { _id }: { _id: string },
    { models, user }: IContext
  ) {
    return models.Sites.duplicateSite(_id, user._id);
  }
};

moduleRequireLogin(webbuilderMutations);

checkPermission(webbuilderMutations, 'webbuilderPagesAdd', 'manageWebbuilder');
checkPermission(webbuilderMutations, 'webbuilderPagesEdit', 'manageWebbuilder');
checkPermission(
  webbuilderMutations,
  'webbuilderPagesRemove',
  'manageWebbuilder'
);

checkPermission(
  webbuilderMutations,
  'webbuilderContentTypesAdd',
  'manageWebbuilder'
);
checkPermission(
  webbuilderMutations,
  'webbuilderContentTypesEdit',
  'manageWebbuilder'
);
checkPermission(
  webbuilderMutations,
  'webbuilderContentTypesRemove',
  'manageWebbuilder'
);

checkPermission(
  webbuilderMutations,
  'webbuilderEntriesAdd',
  'manageWebbuilder'
);
checkPermission(
  webbuilderMutations,
  'webbuilderEntriesEdit',
  'manageWebbuilder'
);
checkPermission(
  webbuilderMutations,
  'webbuilderEntriesRemove',
  'manageWebbuilder'
);

checkPermission(
  webbuilderMutations,
  'webbuilderTemplatesAdd',
  'manageWebbuilder'
);
checkPermission(
  webbuilderMutations,
  'webbuilderTemplatesUse',
  'manageWebbuilder'
);
checkPermission(
  webbuilderMutations,
  'webbuilderTemplatesRemove',
  'manageWebbuilder'
);

checkPermission(webbuilderMutations, 'webbuilderSitesAdd', 'manageWebbuilder');
checkPermission(webbuilderMutations, 'webbuilderSitesEdit', 'manageWebbuilder');
checkPermission(
  webbuilderMutations,
  'webbuilderSitesRemove',
  'manageWebbuilder'
);
checkPermission(
  webbuilderMutations,
  'webbuilderSitesDuplicate',
  'manageWebbuilder'
);

export default webbuilderMutations;
