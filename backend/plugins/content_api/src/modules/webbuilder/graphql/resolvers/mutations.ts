import { IContext } from '~/connectionResolvers';
import { IWeb } from '../../@types/web';
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
    { _id, doc }: { _id: string; doc: IWeb },
    { models }: IContext,
  ) {
    return models.Web.updateWeb(_id, doc);
  },

  async removeWeb(_root, { _id }: { _id: string }, { models }: IContext) {
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

      // save deployment state back to web document
      await models.Web.findOneAndUpdate(
        { _id },
        {
          $set: {
            projectId: result.project?.id,
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
    { models }: IContext,
  ) {
    const web = await models.Web.findOne({ _id });
    if (!web) throw new Error('Web not found');
    if (!web.projectId) throw new Error('No project found for this web');
    return addDomain(web.projectId, domain);
  },

  async cpRemoveProject(_root, { _id }: { _id: string }, { models }: IContext) {
    const web = await models.Web.findOne({ _id });
    if (!web) throw new Error('Web not found');
    if (!web.projectId) throw new Error('No project found for this web');
    return removeProject(web.projectId);
  },
};

webBuilderMutations.cpDeployWeb.wrapperConfig = { forClientPortal: true };
webBuilderMutations.cpAddDomain.wrapperConfig = { forClientPortal: true };
webBuilderMutations.cpRemoveProject.wrapperConfig = { forClientPortal: true };
