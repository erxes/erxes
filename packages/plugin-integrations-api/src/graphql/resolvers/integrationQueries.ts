import { debugFacebook } from '../../debuggers';
import { Comments, Customers, Posts } from '../../facebook/models';
import { Accounts, Configs, Integrations } from '../../models';

const integrationQueries = {
  // app.get('/accounts', async (req, res) => {
  async integrationsGetAccounts(_root, { kind }: { kind: string }) {
    if (kind.includes('nylas')) {
      kind = kind.split('-')[1];
    }
    const selector = { kind };

    return Accounts.find(selector);
  },

  // app.get('/integrations', async (req, res) => {
  async integrationsGetIntegrations(_root, { kind }: { kind: string }) {
    return Integrations.find({ kind });
  },

  //  app.get('/integrationDetail', async (req, res) => {
  async integrationsGetIntegrationDetail(
    _root,
    { erxesApiId }: { erxesApiId: string }
  ) {
    // do not expose fields below
    const integration = await Integrations.findOne(
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

  // app.get('/gmail/get-email',
  async integrationsGetGmailEmail(_root, { accountId }: { accountId: string }) {
    const account = await Accounts.findOne({ _id: accountId });

    if (!account) {
      throw new Error('Account not found');
    }

    return account.email;
  },

  // app.get('/configs', async (req, res) => {
  async integrationsGetConfigs(_root, {}) {
    return Configs.find({});
  },

  // app.get('/facebook/get-comments', async (req, res) => {
  async integrationsConversationFbComments(_root, args) {
    const { postId, isResolved, commentId, senderId } = args;
    let { limit = 10 } = args;

    debugFacebook(`Request to get comments with: ${JSON.stringify(args)}`);

    const post = await Posts.getPost({ erxesApiId: postId });

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
      const customer = await Customers.findOne({ erxesApiId: senderId });

      if (!customer) {
        return null;
      }
      query.senderId = customer.userId;
    } else {
      query.parentId = commentId !== 'undefined' ? commentId : null;
    }

    const result = await Comments.aggregate([
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
  }
};

export default integrationQueries;
