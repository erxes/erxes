import { sendTRPCMessage } from 'erxes-api-shared/utils';

const CP_USERS_PAGE_SIZE = 1000;

type PublishedPostNotification = {
  _id: string;
  title?: string;
  excerpt?: string;
  clientPortalId: string;
  status?: string;
};

type CpUserListResult = {
  list: Array<{ _id: string }>;
  totalCount: number;
};

const fetchCpUserIdsForPortal = async (
  subdomain: string,
  clientPortalId: string,
): Promise<string[]> => {
  const cpUserIds: string[] = [];
  let skip = 0;

  while (true) {
    const result: CpUserListResult = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'cpUsers',
      action: 'list',
      input: {
        clientPortalId,
        limit: CP_USERS_PAGE_SIZE,
        skip,
      },
      defaultValue: { list: [], totalCount: 0 },
    });

    cpUserIds.push(...result.list.map((user) => user._id));

    if (skip + CP_USERS_PAGE_SIZE >= result.totalCount) {
      break;
    }

    skip += CP_USERS_PAGE_SIZE;
  }

  return cpUserIds;
};

const notifyClientPortalUsersOfPublishedPost = async (
  subdomain: string,
  post: PublishedPostNotification,
) => {
  const cpUserIds = await fetchCpUserIdsForPortal(
    subdomain,
    post.clientPortalId,
  );

  if (cpUserIds.length === 0) {
    return;
  }
  console.log('cpUserIds in content',cpUserIds)
  const message =
    (post.title && String(post.title).trim()) ||
    (post.excerpt && String(post.excerpt).trim()) ||
    'A new post has been published';

  const aws = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'mutation',
    module: 'cpNotifications',
    action: 'create',
    input: {
      cpUserIds,
      clientPortalId: post.clientPortalId,
      eventType: 'postPublished',
      data: {
        title: 'New post published',
        message,
        type: 'info',
        contentType: 'content:post',
        contentTypeId: post._id,
        priority: 'medium',
        action: 'openPost',
        kind: 'user',
        metadata: {
          postId: post._id,
          clientPortalId: post.clientPortalId,
        },
      },
    },
  });
  console.log('aws', aws);
};

export const notifyIfNewlyPublished = async (
  subdomain: string,
  post: PublishedPostNotification,
  previousStatus?: string,
) => {
  if (post.status !== 'published' || previousStatus === 'published') {
    return;
  }

  try {
    await notifyClientPortalUsersOfPublishedPost(subdomain, post);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      `Failed to send client portal post published notification: ${message}`,
    );
  }
};
