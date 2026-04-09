import { IContext } from '~/connectionResolvers';
import { Resolver } from 'erxes-api-shared/core-types';
import {
  getDomains,
  getDeployment,
  getDeploymentEvents,
} from '~/modules/webbuilder/utils/utils';

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
    if (!web.vercelProjectId) throw new Error('No project found for this web');
    return getDomains(web.vercelProjectId);
  },

  async cpGetDeploymentEvents(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    const toFriendlyError = (message?: string | null) => {
      if (!message) {
        return 'Deployment failed. Please try again later.';
      }

      let result = String(message);
      result = result.replace(/https?:\/\/\S+/g, '').trim();
      result = result
        .replace(/[\r\n\t]+/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
      result = result.replace(
        /(token|authorization|bearer)\s*[:=]\s*\S+/gi,
        '$1: [redacted]',
      );

      if (result.length > 180) {
        result = result.slice(0, 177).trimEnd() + '...';
      }

      return result || 'Deployment failed. Please try again later.';
    };

    const web = await models.Web.findOne({ _id });
    if (!web) throw new Error('Web not found');

    let domains: string[] | null = null;
    if (web.projectId) {
      try {
        const domainRes = await getDomains(web.projectId);
        const items = Array.isArray(domainRes) ? domainRes : domainRes?.domains;
        if (Array.isArray(items)) {
          domains = items
            .map((d: any) => d?.name)
            .filter((name: any) => typeof name === 'string' && name.length > 0);
        }
      } catch (e) {
        domains = null;
      }
    }

    if (!web.lastDeploymentId) {
      return {
        status: 'not_deployed',
        deploymentUrl: null,
        domains,
        webname: web.name,
        errorReason: 'No deployment found for this web',
      };
    }

    const deployment = await getDeployment(web.lastDeploymentId);

    const status: string =
      deployment?.readyState ||
      deployment?.status ||
      (deployment?.error ? 'error' : 'unknown');

    let rawErrorReason: string | null =
      deployment?.error?.message ||
      deployment?.errorMessage ||
      deployment?.aliasError?.message ||
      null;

    if (status !== 'READY' && !rawErrorReason) {
      try {
        const events = await getDeploymentEvents(web.lastDeploymentId);
        const items = Array.isArray(events) ? events : events?.events;

        if (Array.isArray(items)) {
          const lastWithMessage = [...items]
            .reverse()
            .find(
              (e: any) =>
                e?.payload?.text ||
                e?.text ||
                e?.payload?.message ||
                e?.message,
            );

          rawErrorReason =
            lastWithMessage?.payload?.text ||
            lastWithMessage?.text ||
            lastWithMessage?.payload?.message ||
            lastWithMessage?.message ||
            null;
        }
      } catch (e) {
        // ignore event lookup failures
      }
    }

    const errorReason: string | null =
      status === 'READY' ? null : toFriendlyError(rawErrorReason);

    const deploymentUrl: string | null = deployment?.url || null;

    return {
      status,
      deploymentUrl,
      domains,
      webname: web.name,
      errorReason,
    };
  },

  async cpGetWebActivityLogs(_root, { webId }, { models }: IContext) {
    return models.WebActivityLogs.getLogsForWeb(webId);
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
webQueries.cpGetWebActivityLogs.wrapperConfig = {
  forClientPortal: true,
};
