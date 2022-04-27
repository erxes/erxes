import { getPageList } from '../../facebook/utils';
import { getConfig, getConfigs } from '../../utils';
import { IContext } from '../../connectionResolver';

const integrationQueries = {
  // app.get('/accounts', async (req, res) => {
  async integrationsGetAccounts(_root, { kind }: { kind: string }, { models }: IContext) {
    const selector = { kind };

    return models.Accounts.find(selector);
  },

  // app.get('/integrations', async (req, res) => {
  async integrationsGetIntegrations(_root, { kind }: { kind: string }, { models }: IContext) {
    return models.Integrations.find({ kind });
  },

  //  app.get('/integrationDetail', async (req, res) => {
  async integrationsGetIntegrationDetail(
    _root,
    { erxesApiId }: { erxesApiId: string },
    { models }: IContext
  ) {
    // do not expose fields below
    const integration = await models.Integrations.findOne(
      { erxesApiId },
      {
        nylasToken: 0,
        nylasAccountId: 0,
        nylasBillingState: 0,
        googleAccessToken: 0
      }
    );

    return integration;
  },

  // app.get('/configs', async (req, res) => {
  async integrationsGetConfigs(_root, _args, { models }: IContext) {
    return models.Configs.find({});
  },

  // app.get('/facebook/get-comments', async (req, res) => {
  async integrationsConversationFbComments(_root, args, { models }: IContext) {
    const { postId, isResolved, commentId, senderId } = args;
    let { limit = 10 } = args;

    const post = await models.FbPosts.getPost({ erxesApiId: postId });

    const query: {
      postId: string;
      isResolved?: boolean;
      parentId?: string;
      senderId?: string;
    } = {
      postId: post.postId
    };

    query.isResolved = isResolved === 'false' ? false : true;

    limit = parseInt(limit, 10);

    if (senderId !== 'undefined') {
      const customer = await models.FbCustomers.findOne({ erxesApiId: senderId });

      if (!customer) {
        return null;
      }
      query.senderId = customer.userId;
    } else {
      query.parentId = commentId !== 'undefined' ? commentId : null;
    }

    const result = await models.FbComments.aggregate([
      {
        $match: query
      },
      {
        $lookup: {
          from: 'customers_facebooks',
          localField: 'senderId',
          foreignField: 'userId',
          as: 'customer'
        }
      },
      {
        $unwind: {
          path: '$customer',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'posts_facebooks',
          localField: 'postId',
          foreignField: 'postId',
          as: 'post'
        }
      },
      {
        $unwind: {
          path: '$post',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'comments_facebooks',
          localField: 'commentId',
          foreignField: 'parentId',
          as: 'replies'
        }
      },
      {
        $addFields: {
          commentCount: { $size: '$replies' },
          'customer.avatar': '$customer.profilePic',
          'customer._id': '$customer.erxesApiId',
          conversationId: '$post.erxesApiId'
        }
      },

      { $sort: { timestamp: -1 } },
      { $limit: limit }
    ]);

    return result.reverse();
  },

  // app.get('/facebook/get-comments-count', async (req, res) => {
  async integrationsConversationFbCommentsCount(_root, args, { models }: IContext) {
    const { postId, isResolved = false } = args;

    const post = await models.FbPosts.getPost({ erxesApiId: postId }, true);

    const commentCount = await models.FbComments.countDocuments({
      postId: post.postId,
      isResolved
    });
    const commentCountWithoutReplies = await models.FbComments.countDocuments({
      postId: post.postId,
      isResolved,
      parentId: null
    });

    return {
      commentCount,
      commentCountWithoutReplies
    };
  },

  // app.get('/facebook/get-pages', async (req, res, next) => {
  async integrationsGetFbPages(_root, args, { models }: IContext) {
    const { kind, accountId } = args;

    const account = await models.Accounts.getAccount({ _id: accountId });

    const accessToken = account.token;

    let pages: any[] = [];

    try {
      pages = await getPageList(models, accessToken, kind);
    } catch (e) {
      if (!e.message.includes('Application request limit reached')) {
        await models.Integrations.updateOne(
          { accountId },
          { $set: { healthStatus: 'account-token', error: `${e.message}` } }
        );
      }
    }

    return pages;
  },
};

export default integrationQueries;
