import { IContext } from '~/connectionResolvers';
import { IWeb } from '@/webbuilder/@types/web';
import { Resolver } from 'erxes-api-shared/core-types';
import {
  deploy,
  getDomains,
  addDomain,
  removeProject,
} from '@/webbuilder/utils';

export const webBuilderMutations: Record<string, Resolver> = {
  async createWeb(_root, { doc }: { doc: IWeb }, { models }: IContext) {
    return models.Web.createWeb(doc);
  },

  async editWeb(
    _root,
    { clientPortalId, doc }: { clientPortalId: string; doc: IWeb },
    { models }: IContext,
  ) {
    const web = await models.Web.findOne({ clientPortalId });
    if (!web) throw new Error('Web not found');
    return models.Web.updateWeb(web._id, doc);
  },

  async removeWeb(
    _root,
    { clientPortalId }: { clientPortalId: string },
    { models }: IContext,
  ) {
    const web = await models.Web.findOne({ clientPortalId });
    if (!web) throw new Error('Web not found');
    return models.Web.removeWeb(web._id);
  },

  async cpDeployWeb(
    _root,
    { clientPortalId }: { clientPortalId: string },
    { models, subdomain }: IContext,
  ) {
    try {
      const web = await models.Web.findOne({ clientPortalId });
      if (!web) throw new Error('Web not found');
      const result = await deploy(subdomain, web, models);
  
      await models.Web.findOneAndUpdate(
        { clientPortalId },
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
    { clientPortalId, domain }: { clientPortalId: string; domain: string },
    { models }: IContext,
  ) {
    const web = await models.Web.findOne({ clientPortalId });
    if (!web) throw new Error('Web not found');
    if (!web.projectId) throw new Error('No project found for this web');
    return addDomain(web.projectId, domain);
  },

  async cpRemoveProject(
    _root,
    { clientPortalId }: { clientPortalId: string },
    { models }: IContext,
  ) {
    const web = await models.Web.findOne({ clientPortalId });
    if (!web) throw new Error('Web not found');
    if (!web.projectId) throw new Error('No project found for this web');
    return removeProject(web.projectId);
  },
};

webBuilderMutations.cpDeployWeb.wrapperConfig = { forClientPortal: true };
webBuilderMutations.cpAddDomain.wrapperConfig = { forClientPortal: true };
webBuilderMutations.cpRemoveProject.wrapperConfig = { forClientPortal: true };
