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
      console.log('Deploy result:', JSON.stringify(result));
      return result;
    } catch (error) {
      console.error('cpDeployWeb error:', error.message);
      throw error;
    }
  },

  async cpAddDomain(
    _root,
    { projectId, domain }: { projectId: string; domain: string },
    _context: IContext,
  ) {
    return addDomain(projectId, domain);
  },

  async cpRemoveProject(
    _root,
    { projectId }: { projectId: string },
    _context: IContext,
  ) {
    return removeProject(projectId);
  },
};

webBuilderMutations.cpDeployWeb.wrapperConfig = { forClientPortal: true };
webBuilderMutations.cpAddDomain.wrapperConfig = { forClientPortal: true };
webBuilderMutations.cpRemoveProject.wrapperConfig = { forClientPortal: true };
