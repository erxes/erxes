import { FilterQuery } from 'mongoose';
import { markResolvers } from 'erxes-api-shared/utils';
import { IIntegrationDocument } from '@/inbox/@types/integrations';
import { INTEGRATION_KINDS } from '@/integrations/facebook/constants';
import { debugError } from '@/integrations/facebook/debuggers';
import { fetchPagesPostsList } from '@/integrations/facebook/utils';
import { IContext } from '~/connectionResolvers';

const DEFAULT_POSTS_LIMIT = 20;
const MAX_POSTS_LIMIT = 100;

type TFacebookGetPostsArgs = {
  brandIds?: (string | null)[] | null;
  channelIds?: (string | null)[] | null;
  limit?: number | null;
};

type TFacebookPagePost = {
  id?: string;
  message?: string;
  created_time?: string;
  picture?: string;
  full_picture?: string;
  permalink_url?: string;
};

const compactIds = (ids?: (string | null)[] | null): string[] =>
  (ids || [])
    .flatMap((id) => (id ? id.split(',') : []))
    .map((id) => id.trim())
    .filter(Boolean);

const resolvePostsLimit = (limit?: number | null): number => {
  if (limit === undefined || limit === null) {
    return DEFAULT_POSTS_LIMIT;
  }

  if (limit < 1) {
    throw new Error('limit must be a positive integer');
  }

  return Math.min(limit, MAX_POSTS_LIMIT);
};

const postTime = (post: TFacebookPagePost): number =>
  Date.parse(post.created_time || '') || 0;

const fetchPagePosts = async (
  pageId: string,
  accessToken: string,
  limit: number,
): Promise<TFacebookPagePost[]> => {
  try {
    return await fetchPagesPostsList(pageId, accessToken, limit);
  } catch (e) {
    debugError(`Error fetching posts of facebook page ${pageId}: ${e.message}`);
    return [];
  }
};

export const cpFacebookQueries = {
  async facebookGetPosts(
    _root: undefined,
    { brandIds, channelIds, limit }: TFacebookGetPostsArgs,
    { models }: IContext,
  ): Promise<TFacebookPagePost[]> {
    const postsLimit = resolvePostsLimit(limit);
    const brandIdList = compactIds(brandIds);
    const channelIdList = compactIds(channelIds);

    const selector: FilterQuery<IIntegrationDocument> = {
      kind: INTEGRATION_KINDS.POST,
      isActive: { $ne: false },
    };

    if (brandIdList.length) {
      selector.brandId = { $in: brandIdList };
    }

    if (channelIdList.length) {
      selector.channelId = { $in: channelIdList };
    }

    const integrationIds = await models.Integrations.distinct('_id', selector);

    if (!integrationIds.length) {
      return [];
    }

    const facebookIntegrations = await models.FacebookIntegrations.find(
      { erxesApiId: { $in: integrationIds } },
      { facebookPageIds: 1, facebookPageTokensMap: 1 },
    ).lean();

    const pageTokens = new Map<string, string>();

    for (const integration of facebookIntegrations) {
      const tokensMap = integration.facebookPageTokensMap || {};

      for (const pageId of integration.facebookPageIds || []) {
        if (tokensMap[pageId] && !pageTokens.has(pageId)) {
          pageTokens.set(pageId, tokensMap[pageId]);
        }
      }
    }

    const pagePosts = await Promise.all(
      [...pageTokens].map(([pageId, accessToken]) =>
        fetchPagePosts(pageId, accessToken, postsLimit),
      ),
    );

    return pagePosts
      .flat()
      .sort((a, b) => postTime(b) - postTime(a))
      .slice(0, postsLimit);
  },
};

markResolvers(cpFacebookQueries, {
  wrapperConfig: {
    forClientPortal: true,
  },
});
