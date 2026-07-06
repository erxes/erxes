import type { App } from '@octokit/app';
import { generateModels } from '~/connectionResolvers';
import { STATUS_TYPES } from '~/modules/status/constants/types';

let app: App | null = null;

type GithubStateReason = 'completed' | 'not_planned' | null;

const getApp = async (): Promise<App> => {
  if (!app) {
    const { App } = await import('@octokit/app');
    const appId = process.env.GITHUB_APP_ID;
    const privateKey = process.env.GITHUB_PRIVATE_KEY;

    if (!appId || !privateKey) {
      throw new Error(
        'Missing GITHUB_APP_ID or GITHUB_PRIVATE_KEY env variables',
      );
    }

    app = new App({
      appId,
      privateKey: Buffer.from(privateKey, 'base64').toString('utf8'),
    });
  }
  return app;
};

type AppInstance = Awaited<ReturnType<typeof getApp>>;
type OctokitInstance = ReturnType<
  AppInstance['getInstallationOctokit']
> extends Promise<infer U>
  ? U
  : never;

export const getInstallationOctokit = async (
  installationId: number,
): Promise<any> => {
  const instance = await getApp();
  return instance.getInstallationOctokit(installationId);
};

export const getAppOctokit = async (): Promise<any> => {
  const instance = await getApp();
  return instance.octokit;
};

export const createGithubIssue = async (
  octokit: OctokitInstance,
  repoFullName: string,
  title: string,
  body?: string,
) => {
  const [owner, repo] = repoFullName.split('/');
  if (!body) {
    body = 'No description provided.';
  }
  const response = await octokit.request('POST /repos/{owner}/{repo}/issues', {
    owner,
    repo,
    title,
    body,
  });
  return {
    issueNumber: response.data.number,
    issueUrl: response.data.html_url,
  };
};

export const updateGithubIssueState = async (
  octokit: OctokitInstance,
  repoFullName: string,
  issueNumber: number,
  statusId: string,
  subdomain: string,
) => {
  const [owner, repo] = repoFullName.split('/');
  const models = await generateModels(subdomain);
  const status = await models.Status.getStatus(statusId || '');
  const { state, stateReason } = mapStatusToGithubState(status?.type || 1);
  await octokit.request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', {
    owner,
    repo,
    issue_number: issueNumber,
    state,
    ...(stateReason ? { state_reason: stateReason } : {}),
  });
};

function mapStatusToGithubState(erxesStatus: number): {
  state: 'open' | 'closed';
  stateReason?: GithubStateReason;
} {
  switch (erxesStatus) {
    case STATUS_TYPES.COMPLETED:
      return { state: 'closed', stateReason: 'completed' };
    case STATUS_TYPES.CANCELLED:
      return { state: 'closed', stateReason: 'not_planned' };
    default:
      return { state: 'open' };
  }
}

export const updateGithubIssueBody = async (
  installationId: number,
  owner: string,
  repo: string,
  issueNumber: number,
  newBody: string,
): Promise<void> => {
  try {
    const octokit = await getInstallationOctokit(installationId);

    await octokit.request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', {
      owner,
      repo,
      issue_number: issueNumber,
      body: newBody,
    });
  } catch (error) {
    console.error('Failed to update GitHub issue body', {
      owner,
      repo,
      issueNumber,
      error,
    });
  }
};
