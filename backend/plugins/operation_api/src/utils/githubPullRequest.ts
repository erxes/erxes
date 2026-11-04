import { TDiscordPullRequest } from '@/discordIntegration/@types/discordNotification';
import { notifyDiscordPullRequestMerged } from '@/discordIntegration/utils/notifyDiscord';
import { generateModels } from '~/connectionResolvers';

type TPayloadRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is TPayloadRecord =>
  typeof value === 'object' && value !== null;

const readRecord = (record: TPayloadRecord, key: string): TPayloadRecord => {
  const value = record[key];

  return isRecord(value) ? value : {};
};

const readString = (record: TPayloadRecord, key: string) => {
  const value = record[key];

  return typeof value === 'string' ? value : '';
};

const readNumber = (record: TPayloadRecord, key: string) => {
  const value = record[key];

  return typeof value === 'number' ? value : undefined;
};

const parseMergedPullRequest = (payload: unknown) => {
  if (!isRecord(payload) || payload.action !== 'closed') {
    return null;
  }

  const pullRequest = readRecord(payload, 'pull_request');
  const number = readNumber(pullRequest, 'number');
  const installationId = readNumber(readRecord(payload, 'installation'), 'id');
  const repoName = readString(readRecord(payload, 'repository'), 'full_name');
  const url = readString(pullRequest, 'html_url');

  if (
    pullRequest.merged !== true ||
    number === undefined ||
    installationId === undefined ||
    !repoName ||
    !url
  ) {
    return null;
  }

  const author = readRecord(pullRequest, 'user');

  const merged: TDiscordPullRequest = {
    number,
    title: readString(pullRequest, 'title'),
    body: readString(pullRequest, 'body'),
    url,
    repoName,
    authorLogin: readString(author, 'login'),
    authorUrl: readString(author, 'html_url'),
    mergedByLogin: readString(readRecord(pullRequest, 'merged_by'), 'login'),
    headRef: readString(readRecord(pullRequest, 'head'), 'ref'),
    baseRef: readString(readRecord(pullRequest, 'base'), 'ref'),
    mergedAt: readString(pullRequest, 'merged_at'),
  };

  return { installationId, pullRequest: merged };
};

export const handleGithubPullRequest = async (
  payload: unknown,
  subdomain: string,
) => {
  const merged = parseMergedPullRequest(payload);

  if (!merged) {
    return false;
  }

  const models = await generateModels(subdomain);

  const config = await models.GithubConfig.findOne({
    installationId: merged.installationId,
    repoName: merged.pullRequest.repoName,
    subdomain,
  })
    .select('teamId')
    .lean();

  if (!config?.teamId) {
    return false;
  }

  await notifyDiscordPullRequestMerged(models, {
    subdomain,
    teamId: String(config.teamId),
    pullRequest: merged.pullRequest,
  });

  return true;
};
