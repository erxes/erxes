import { IContext } from '~/connectionResolvers';
import { Resolver } from 'erxes-api-shared/core-types';
import { getDomains, getDeployment } from '~/modules/webbuilder/utils/utils';

export const webQueries: Record<string, Resolver> = {
  async getWebList(_root, _args, { models }: IContext) {
    return models.Web.getWebList();
  },

  async getWebDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    const web = await models.Web.findOne({ _id });
    if (!web) throw new Error('Web not found');
    return web;
  },

  async cpGetWebDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    const web = await models.Web.findOne({ _id });
    if (!web) throw new Error('Web not found');
    return web;
  },

  async cpGetDomains(_root, { _id }: { _id: string }, { models }: IContext) {
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

    if (!web.lastDeploymentId) {
      return {
        status: 'not_deployed',
        domain: null,
        webname: web.name,
        errorReason: 'No deployment found for this web',
      };
    }

    const deployment = await getDeployment(web.lastDeploymentId);

    const status: string =
      deployment?.readyState ||
      deployment?.status ||
      (deployment?.error ? 'error' : 'unknown');

    const errorReason: string | null =
      deployment?.error?.message ||
      deployment?.errorMessage ||
      deployment?.aliasError?.message ||
      null;

    const domain: string | null =
      web.domain || web.lastDeploymentUrl || deployment?.url || null;

    return {
      status,
      domain: status === 'READY' ? domain : null,
      webname: web.name,
      errorReason: status === 'READY' ? null : errorReason,
    };
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
