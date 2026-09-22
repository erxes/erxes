import type { App } from '@octokit/app';
import { generateModels } from '~/connectionResolvers';
import { STATUS_TYPES } from '~/modules/status/constants/types';

let app: App | null = null;

type GithubStateReason = 'completed' | 'not_planned' | null;

interface GithubMilestone {
  id: number;
  number: number;
  title: string;
}

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
export type OctokitInstance = ReturnType<
  AppInstance['getInstallationOctokit']
> extends Promise<infer U>
  ? U
  : never;

export const getInstallationOctokit = async (
  installationId: number,
): Promise<OctokitInstance> => {
  const instance = await getApp();
  return instance.getInstallationOctokit(installationId);
};

export const getAppOctokit = async (): Promise<AppInstance['octokit']> => {
  const instance = await getApp();
  return instance.octokit;
};

const getRepositoryParts = (repoFullName: string) => {
  const [owner, repo] = repoFullName.split('/');

  if (!owner || !repo) {
    throw new Error(`Invalid GitHub repository name: ${repoFullName}`);
  }

  return { owner, repo };
};

export const createGithubIssue = async (
  octokit: OctokitInstance,
  repoFullName: string,
  title: string,
  body?: string,
) => {
  const { owner, repo } = getRepositoryParts(repoFullName);
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
  const { owner, repo } = getRepositoryParts(repoFullName);
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

const resolveGithubMilestoneNumber = async (
  octokit: OctokitInstance,
  repoFullName: string,
  erxesMilestoneId: string,
  installationId: number,
  subdomain: string,
): Promise<number> => {
  const models = await generateModels(subdomain);
  const existingMapping = await models.GithubMilestoneMapping.findOne({
    subdomain,
    installationId,
    repoName: repoFullName,
    erxesMilestoneId,
  }).lean();

  if (existingMapping) {
    return existingMapping.githubMilestoneNumber;
  }

  const erxesMilestone = await models.Milestone.findOne({
    _id: erxesMilestoneId,
  }).lean();

  if (!erxesMilestone) {
    throw new Error(`erxes milestone not found: ${erxesMilestoneId}`);
  }

  const { owner, repo } = getRepositoryParts(repoFullName);
  const matchingMilestones: GithubMilestone[] = [];
  let page = 1;
  let hasMoreMilestones = true;

  while (hasMoreMilestones) {
    const response = await octokit.request(
      'GET /repos/{owner}/{repo}/milestones',
      {
        owner,
        repo,
        state: 'all',
        per_page: 100,
        page,
      },
    );
    matchingMilestones.push(
      ...response.data
        .filter((milestone) => milestone.title === erxesMilestone.name)
        .map((milestone) => ({
          id: milestone.id,
          number: milestone.number,
          title: milestone.title,
        })),
    );
    hasMoreMilestones = response.data.length === 100;
    page += 1;
  }
  const mappedGithubMilestoneIds = new Set(
    (
      await models.GithubMilestoneMapping.find({
        subdomain,
        installationId,
        repoName: repoFullName,
        githubMilestoneId: {
          $in: matchingMilestones.map((milestone) => milestone.id),
        },
      })
        .select('githubMilestoneId')
        .lean()
    ).map((mapping) => mapping.githubMilestoneId),
  );
  let githubMilestone = matchingMilestones.find(
    (milestone) => !mappedGithubMilestoneIds.has(milestone.id),
  );

  if (!githubMilestone) {
    const response = await octokit.request(
      'POST /repos/{owner}/{repo}/milestones',
      {
        owner,
        repo,
        title: erxesMilestone.name,
      },
    );
    githubMilestone = {
      id: response.data.id,
      number: response.data.number,
      title: response.data.title,
    };
  }

  const mapping = await models.GithubMilestoneMapping.upsertMapping({
    subdomain,
    installationId,
    repoName: repoFullName,
    erxesMilestoneId,
    githubMilestoneId: githubMilestone.id,
    githubMilestoneNumber: githubMilestone.number,
    githubMilestoneTitle: githubMilestone.title,
  });

  if (!mapping) {
    throw new Error('Could not save the GitHub milestone mapping');
  }

  return mapping.githubMilestoneNumber;
};

export const updateGithubIssueMilestone = async (
  octokit: OctokitInstance,
  repoFullName: string,
  issueNumber: number,
  erxesMilestoneId: string | null,
  installationId: number,
  subdomain: string,
): Promise<void> => {
  const { owner, repo } = getRepositoryParts(repoFullName);
  const githubMilestoneNumber = erxesMilestoneId
    ? await resolveGithubMilestoneNumber(
        octokit,
        repoFullName,
        erxesMilestoneId,
        installationId,
        subdomain,
      )
    : null;

  await octokit.request('PATCH /repos/{owner}/{repo}/issues/{issue_number}', {
    owner,
    repo,
    issue_number: issueNumber,
    milestone: githubMilestoneNumber,
  });
};

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
