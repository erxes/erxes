import { IContext } from '~/connectionResolvers';
import { IWeb } from '@/webbuilder/@types/web';
import { Resolver } from 'erxes-api-shared/core-types';
import {
  deploy,
  addDomain,
  removeProject,
} from '~/modules/webbuilder/utils/utils';
import { diffWeb } from '~/modules/webbuilder/utils/diffWeb';

export const webBuilderMutations: Record<string, Resolver> = {
  async createWeb(_root, { doc }: { doc: IWeb }, { models }: IContext) {
    const web = await models.Web.createWeb(doc);

    const defaultPages = [
      'home',
      'about',
      'contact',
      'privacy',
      'terms',
      'blogs',
      'blog',
    ];
    const tourPages = [
      'tours',
      'tour',
      'checkout',
      'confirmation',
      'profile',
      'login',
      'register',
      'booking',
      'inquiry',
    ];
    const ecommercePages = [
      'products',
      'product',
      'checkout',
      'profile',
      'confirmation',
      'login',
      'register',
      'booking',
    ];
    const commerceKinds = ['ecommerce', 'restaurant', 'hotel'];

    const templateType = web.templateType || '';
    const extraPages =
      templateType === 'tour'
        ? tourPages
        : commerceKinds.includes(templateType)
          ? ecommercePages
          : [];

    const uniqueSlugs = [...new Set([...defaultPages, ...extraPages])];

    const bulk = uniqueSlugs.map((slug) => ({
      webId: web._id,
      clientPortalId: web.clientPortalId,
      name: slug.charAt(0).toUpperCase() + slug.slice(1),
      slug,
      pageItems: [],
    }));

    await models.WebPages.insertMany(bulk);

    return web;
  },

  async editWeb(
    _root,
    { _id, doc }: { _id: string; doc: IWeb },
    { models, user }: IContext,
  ) {
    const oldWeb = await models.Web.findOne({ _id }).lean();
    if (!oldWeb) {
      throw new Error('Web not found');
    }

    if (
      doc.clientPortalId !== undefined &&
      doc.clientPortalId !== oldWeb.clientPortalId
    ) {
      throw new Error('clientPortalId cannot be changed for an existing web');
    }

    const { clientPortalId: _ignoredClientPortalId, ...restDoc } = doc;

    const updated = await models.Web.updateWeb(_id, restDoc);

    const changes = diffWeb(oldWeb, restDoc);
    if (changes.length > 0) {
      await models.WebActivityLogs.createLog({
        webId: _id,
        userId: user?._id,
        action: 'updated',
        changes,
        createdAt: new Date(),
      });
    }

    return updated;
  },

  async removeWeb(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Web.removeWeb(_id);
  },

  async cpEditWeb(
    _root,
    { _id, doc }: { _id: string; doc: IWeb },
    { models, clientPortal, user }: IContext,
  ) {
    const web = await models.Web.findOne({
      _id,
      clientPortalId: clientPortal?._id,
    });

    if (!web) throw new Error('Web not found');

    if (
      doc.clientPortalId !== undefined &&
      doc.clientPortalId !== clientPortal?._id
    ) {
      throw new Error('clientPortalId cannot be changed for an existing web');
    }

    const { clientPortalId: _ignoredClientPortalId, ...restDoc } = doc;

    const updatedDoc = {
      ...restDoc,
      clientPortalId: clientPortal?._id,
    };

    const updated = await models.Web.updateWeb(_id, updatedDoc);

    const changes = diffWeb(web.toObject(), restDoc);
    if (changes.length > 0) {
      await models.WebActivityLogs.createLog({
        webId: _id,
        userId: user?._id,
        action: 'updated',
        changes,
        createdAt: new Date(),
      });
    }

    return updated;
  },

  async cpRemoveWeb(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Web.removeWeb(_id);
  },

  async cpDeployWeb(
    _root,
    { _id }: { _id: string },
    { models, subdomain, clientPortal }: IContext,
  ) {
    try {
      const web = await models.Web.findOne({ _id });
      if (!web) throw new Error('Web not found');

      if (!web.erxesAppToken && clientPortal?.token) {
        web.erxesAppToken = clientPortal.token;
      }

      const result = await deploy(subdomain, web, models);

      await models.Web.findOneAndUpdate(
        { _id },
        {
          $set: {
            vercelProjectId: result.projectId,
            lastDeploymentId: result.id,
            lastDeploymentUrl: result.url,
          },
        },
      );
      return result;
    } catch (error) {
      console.error('cpDeployWeb error:', error.message);
      throw error;
    }
  },

  async cpAddDomain(
    _root,
    { _id, domain }: { _id: string; domain: string },
    { models, clientPortal }: IContext,
  ) {
    const web = await models.Web.findOne({
      _id,
      clientPortalId: clientPortal?._id,
    });
    if (!web) throw new Error('Web not found');
    if (!web.vercelProjectId) throw new Error('No project found for this web');
    return addDomain(web.vercelProjectId, domain);
  },

  async cpRemoveProject(
    _root,
    { _id }: { _id: string },
    { models, clientPortal }: IContext,
  ) {
    const web = await models.Web.findOne({
      _id,
      clientPortalId: clientPortal?._id,
    });
    if (!web) throw new Error('Web not found');
    if (!web.projectId) throw new Error('No project found for this web');
    if (!web.vercelProjectId)
      throw new Error('No vercel project id found for this web');
    return removeProject(web.vercelProjectId);
  },
};

webBuilderMutations.cpDeployWeb.wrapperConfig = { forClientPortal: true };
webBuilderMutations.cpAddDomain.wrapperConfig = { forClientPortal: true };
webBuilderMutations.cpRemoveProject.wrapperConfig = { forClientPortal: true };
webBuilderMutations.cpEditWeb.wrapperConfig = { forClientPortal: true };
webBuilderMutations.cpRemoveWeb.wrapperConfig = { forClientPortal: true };
