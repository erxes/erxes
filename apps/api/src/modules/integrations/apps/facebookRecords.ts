import { z } from 'zod';
import { type AppRecords, type OAuthKeys, Text } from '@erxes/plugin-sdk/integrations';
import { graph, pageToken } from './facebookGraph';

const LIMIT = 100;

const Pages = z.object({ data: z.array(z.object({ id: Text, name: z.string().optional() })) });

const Posts = z.object({
  data: z.array(
    z.object({
      id: Text,
      message: z.string().optional(),
      story: z.string().optional(),
      created_time: z.string().optional(),
    }),
  ),
});

const shortened = (text: string) => {
  const line = text.replace(/\s+/g, ' ').trim();

  return line.length > 80 ? `${line.slice(0, 79)}…` : line;
};

/** The pages the signed-in account manages, and a page's latest posts. */
export const FACEBOOK_RECORDS: AppRecords<OAuthKeys> = {
  page: {
    async list({ client: keys }) {
      const pages = await graph(`/me/accounts?fields=id,name&limit=${LIMIT}`, Pages, {
        token: keys.accessToken,
      });

      return pages.data.map((page) => ({ value: page.id, label: page.name ?? page.id }));
    },
  },
  post: {
    async list({ client: keys, parents: [page] }) {
      if (!page) return [];

      const posts = await graph(
        `/${encodeURIComponent(page)}/posts?fields=id,message,story,created_time&limit=${LIMIT}`,
        Posts,
        { token: await pageToken(keys.accessToken, page) },
      );

      return posts.data.map((post) => ({
        value: post.id,
        label: shortened(
          post.message ?? post.story ?? `Post of ${post.created_time?.slice(0, 10) ?? post.id}`,
        ),
      }));
    },
  },
};
