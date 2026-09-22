import { IModels } from '~/connectionResolvers';

const GRAPH_BASE = 'https://graph.facebook.com';
const POST_FIELDS =
  'id,comments.filter(stream).summary(true),reactions.summary(true),shares';
const DEFAULT_POST_LIMIT = 50;
const MAX_POST_LIMIT = 100;

type MetaPost = {
  id?: string;
  comments?: { summary?: { total_count?: number } };
  reactions?: { summary?: { total_count?: number } };
  shares?: { count?: number };
};

export type FacebookSyncError = {
  pageId: string;
  message: string;
};

export type FacebookSyncResult = {
  pages: number;
  fetched: number;
  updated: number;
  missingInErxes: number;
  syncedAt: Date;
  errors: FacebookSyncError[];
};

const resolvePageTokens = async (
  models: IModels,
  pageIds?: string[],
): Promise<Map<string, string>> => {
  const integrations = await models.FacebookIntegrations.find(
    { facebookPageIds: { $exists: true, $ne: [] } },
    { facebookPageIds: 1, facebookPageTokensMap: 1 },
  ).lean();

  const selected = pageIds?.length ? new Set(pageIds) : null;
  const tokens = new Map<string, string>();

  for (const integration of integrations) {
    const tokenMap = integration.facebookPageTokensMap || {};

    for (const pageId of integration.facebookPageIds || []) {
      if (!pageId || (selected && !selected.has(pageId))) {
        continue;
      }

      const token = tokenMap[pageId];

      if (token && !tokens.has(pageId)) {
        tokens.set(pageId, token);
      }
    }
  }

  return tokens;
};

const fetchPageStats = async (
  pageId: string,
  token: string,
  limit: number,
): Promise<MetaPost[]> => {
  const url = `${GRAPH_BASE}/${pageId}/posts?fields=${POST_FIELDS}&limit=${limit}&access_token=${encodeURIComponent(
    token,
  )}`;

  const response = await fetch(url);
  const body = (await response.json()) as {
    data?: MetaPost[];
    error?: { message?: string };
  };

  if (!response.ok || body.error) {
    throw new Error(
      body.error?.message || `Facebook returned ${response.status}`,
    );
  }

  return body.data || [];
};

export const syncFacebookPostStats = async ({
  models,
  pageIds,
  limit,
}: {
  models: IModels;
  pageIds?: string[];
  limit?: number;
}): Promise<FacebookSyncResult> => {
  const postLimit = Math.min(limit || DEFAULT_POST_LIMIT, MAX_POST_LIMIT);
  const tokens = await resolvePageTokens(models, pageIds);
  const syncedAt = new Date();
  const errors: FacebookSyncError[] = [];

  if (!tokens.size) {
    throw new Error(
      'No Facebook page with a stored page token matched this selection',
    );
  }

  let fetched = 0;
  let updated = 0;
  let missingInErxes = 0;

  for (const [pageId, token] of tokens) {
    let posts: MetaPost[];

    try {
      posts = await fetchPageStats(pageId, token, postLimit);
    } catch (e) {
      errors.push({ pageId, message: e.message });
      continue;
    }

    for (const post of posts) {
      if (!post.id) {
        continue;
      }

      fetched += 1;

      const bareId = post.id.includes('_') ? post.id.split('_')[1] : post.id;

      const result = await models.FacebookPostConversations.updateOne(
        {
          recipientId: pageId,
          postId: { $in: [post.id, bareId] },
        },
        {
          $set: {
            metaCommentCount: post.comments?.summary?.total_count ?? 0,
            metaReactionCount: post.reactions?.summary?.total_count ?? 0,
            metaShareCount: post.shares?.count ?? 0,
            metaSyncedAt: syncedAt,
          },
        },
      );

      if (result.matchedCount) {
        updated += 1;
      } else {
        missingInErxes += 1;
      }
    }
  }

  return {
    pages: tokens.size,
    fetched,
    updated,
    missingInErxes,
    syncedAt,
    errors,
  };
};
