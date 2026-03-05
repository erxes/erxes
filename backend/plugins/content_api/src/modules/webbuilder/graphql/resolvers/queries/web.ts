import { IContext } from '~/connectionResolvers';
import { Resolver } from 'erxes-api-shared/core-types';
import { getDomains, getDeploymentEvents } from '~/modules/webbuilder/utils/utils';

export const webQueries: Record<string, Resolver> = {
  async getWebList(_root, _args, { models }: IContext) {
    return models.Web.getWebList();
  },

  async getWebDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    const web = await models.Web.findOne({ _id });
    if (!web) throw new Error('Web not found');
    return web;
  },
  

  async cpGetWebDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    const web = await models.Web.findOne({ _id });
    if (!web) throw new Error('Web not found');
    return web;
  },
  
  async cpGetDomains(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    const web = await models.Web.findOne({ _id });
    if (!web) throw new Error('Web not found');
    if (!web.projectId) throw new Error('No project found for this web');
    return getDomains(web.projectId);
  },
  
  async cpGetDeploymentEvents(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    const web = await models.Web.findOne({ _id });
    if (!web) throw new Error('Web not found');
    if (!web.lastDeploymentId) throw new Error('No deployment found for this web');
    return getDeploymentEvents(web.lastDeploymentId);
  },
};

webQueries.cpGetWebDetail.wrapperConfig = {
  forClientPortal: true,
};

webQueries.cpGetDomains.wrapperConfig = {
  forClientPortal: true,
};

webQueries.cpGetDeploymentEvents.wrapperConfig = {
  forClientPortal: true,
};
