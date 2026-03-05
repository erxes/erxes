import { IContext } from '~/connectionResolvers';
import { IWeb } from '@/webbuilder/@types/web';
import { Resolver } from 'erxes-api-shared/core-types';
import {
  deploy,
  addDomain,
  removeProject,
} from '@/webbuilder/utils';

export const webBuilderMutations: Record<string, Resolver> = {
  async createWeb(
    _root,
    { doc }: { doc: IWeb },
    { models }: IContext,
  ) {
    const web = await models.Web.createWeb(doc);
  
    const defaultPages = ['home', 'about', 'contact', 'privacy', 'terms'];
    const tourPages = ['tours', 'tour', 'checkout', 'confirmation', 'profile', 'login', 'register'];
    const ecommercePages = ['products', 'product', 'checkout', 'profile', 'confirmation', 'login', 'register'];
    const commerceKinds = ['ecommerce', 'restaurant', 'hotel'];
  
    const templateType = web.templateType || '';
    const extraPages = templateType === 'tour'
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
    { models }: IContext,
  ) {
    return models.Web.updateWeb(_id, doc);
  },

  async removeWeb(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.Web.removeWeb(_id);
  },
  
  async cpEditWeb(
    _root,
    { _id, doc }: { _id: string; doc: IWeb },
    { models }: IContext,
  ) {
    return models.Web.updateWeb(_id, doc);
  },

  async cpRemoveWeb(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.Web.removeWeb(_id);
  },

  async cpDeployWeb(
    _root,
    { _id }: { _id: string },
    { models, subdomain }: IContext,
  ) {
    try {
      const web = await models.Web.findOne({ _id });
      if (!web) throw new Error('Web not found');
      const result = await deploy(subdomain, web, models);
      await models.Web.findOneAndUpdate(
        { _id },
        { $set: {
          projectId: result.project?.id,
          lastDeploymentId: result.id,
          lastDeploymentUrl: result.url,
        }},
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
    { models }: IContext,
  ) {
    const web = await models.Web.findOne({ _id });
    if (!web) throw new Error('Web not found');
    if (!web.projectId) throw new Error('No project found for this web');
    return addDomain(web.projectId, domain);
  },

  async cpRemoveProject(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    const web = await models.Web.findOne({ _id });
    if (!web) throw new Error('Web not found');
    if (!web.projectId) throw new Error('No project found for this web');
    return removeProject(web.projectId);
  },
};

webBuilderMutations.cpDeployWeb.wrapperConfig = { forClientPortal: true };
webBuilderMutations.cpAddDomain.wrapperConfig = { forClientPortal: true };
webBuilderMutations.cpRemoveProject.wrapperConfig = { forClientPortal: true };
webBuilderMutations.cpEditWeb.wrapperConfig = { forClientPortal: true };
webBuilderMutations.cpRemoveWeb.wrapperConfig = { forClientPortal: true };
