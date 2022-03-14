import { IUserDocument } from './db/models/definitions/users';
import EmailDeliveries from './db/models/EmailDeliveries';
import Users from './db/models/Users';

export default {
  getActivityContent: async ({ data }) => {
    const { action, content } = data;

    if (action === 'assignee') {
      let addedUsers: IUserDocument[] = [];
      let removedUsers: IUserDocument[] = [];

      if (content) {
        addedUsers = await Users.find({ _id: { $in: content.addedUserIds } });

        removedUsers = await Users.find({
          _id: { $in: content.removedUserIds }
        });
      }

      return {
        data: { addedUsers, removedUsers },
        status: 'success'
      };
    }

    return {
      status: 'error',
      data: 'wrong activity action'
    };
  },
  collectItems: async ({ data: { contentId } }) => {
    const deliveries = await EmailDeliveries.find({
      customerId: contentId
    }).lean();

    const results: any[] = [];

    for (const d of deliveries) {
      results.push({
        _id: d._id,
        contentType: 'email',
        contentId,
        createdAt: d.createdAt
      });
    }

    return {
      status: 'success',
      data: results
    };
  }
};
