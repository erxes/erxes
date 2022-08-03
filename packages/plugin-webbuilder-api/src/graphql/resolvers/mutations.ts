import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { IPage } from '../../models/pages';
import { IContentType } from '../../models/contentTypes';
import { IEntry } from '../../models/entries';
import { IContext, models } from '../../connectionResolver';
import { ITemplate } from '../../models/templates';
import { ISite } from '../../models/sites';

interface IContentTypeEdit extends IContentType {
  _id: string;
}

const webbuilderMutations = {
  async webbuilderPagesAdd(_root, doc: IPage, { models }: IContext) {
    return models.Pages.createPage(doc);
  },

  async webbuilderPagesEdit(
    _root,
    args: { _id: string } & IPage,
    { models }: IContext
  ) {
    const { _id, ...doc } = args;

    return models.Pages.updatePage(_id, doc);
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
