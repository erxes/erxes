import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { IPage } from '../../models/pages';
import { IContentType } from '../../models/contentTypes';
import { IEntry } from '../../models/entries';
import { IContext } from '../../connectionResolver';
import { ITemplate } from '../../models/templates';
import { ISite } from '../../models/sites';
import { createSiteContentTypes, writeAndReadHelpersData } from './utils';

interface IContentTypeEdit extends IContentType {
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
    { models }: IContext
  ) {
    return models.ContentTypes.createContentType(doc);
  },

  async webbuilderContentTypesEdit(
    _root,
    { _id, ...doc }: IContentTypeEdit,
    { models }: IContext
  ) {
    return models.ContentTypes.updateContentType(_id, doc);
  },

  async webbuilderContentTypesRemove(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.ContentTypes.removeContentType(_id);
  },

  async webbuilderEntriesAdd(_root, doc: IEntry, { models }: IContext) {
    return models.Entries.create(doc);
  },

  async webbuilderEntriesEdit(
    _root,
    { _id, ...doc }: { _id: string & IEntry },
    { models }: IContext
  ) {
    await models.Entries.updateOne({ _id }, { $set: doc });

    return models.Entries.findOne({ _id });
  },

  async webbuilderEntriesRemove(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.Entries.deleteOne({ _id });
  },

  async webbuilderTemplatesAdd(_root, doc: ITemplate, { models }: IContext) {
    return models.Templates.createTemplate(doc);
  },

  async webbuilderTemplatesUse(
    _root,
    { _id, name }: { _id: string; name: string },
    { models, user }: IContext
  ) {
    const siteName = await models.Sites.createSite(
      {
        templateId: _id,
        name
      },
      true
    );

    const site = await models.Sites.findOne({ name: siteName });

    if (!site) {
      return;
    }

    const pages = await writeAndReadHelpersData('pages', `templateId=${_id}`);

    if (!pages.length) {
      return;
    }

    // read and write all content types from erxes-helper
    const contentTypesAll = await writeAndReadHelpersData('contentTypes');

    // read and write all entries from erxes-helper
    const entriesAll = await writeAndReadHelpersData('entries');

    for (const page of pages) {
      await models.Pages.createPage(
        {
          ...page,
          _id: undefined,
          siteId: site._id
        },
        user._id
      );

      // find contentTypes related with page
      const contentTypes = contentTypesAll.filter(
        type => type.code + '_entry' === page.name
      );

      if (!contentTypes.length) {
        continue;
      }

      // create content types and entries
      await createSiteContentTypes(models, {
        siteId: site._id,
        contentTypes,
        entriesAll
      });
    }
  },

  async webbuilderTemplatesRemove(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.Templates.deleteOne({ _id });
  },

  async webbuilderSitesAdd(_root, doc: ISite, { models }: IContext) {
    return models.Sites.createSite(doc);
  },

  async webbuilderSitesEdit(
    _root,
    args: { _id: string } & ISite,
    { models }: IContext
  ) {
    const { _id, ...doc } = args;

    return models.Sites.updateSite(_id, doc);
  },

  async webbuilderSitesRemove(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.Sites.removeSite(_id);
  }
};

moduleRequireLogin(webbuilderMutations);

export default webbuilderMutations;
