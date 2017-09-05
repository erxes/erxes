import { EngageMessages } from '../../../db/models';

// status query builder
const statusQueryBuilder = status => {
  if (status === 'live') {
    return { isLive: true };
  }

  if (status === 'draft') {
    return { isDraft: true };
  }

  if (status === 'paused') {
    return { isLive: false };
  }

  if (status === 'yours') {
    return { fromUserId: this.userId };
  }

  return {};
};

export default {
  engageMessages(root, { kind, status, tag }) {
    let query = {};

    // manual or auto
    if (kind) {
      query.kind = kind;
    }

    // filter by status
    if (status) {
      query = { ...query, ...statusQueryBuilder(status) };
    }

    // Tag filter && count ===================
    const tagQueryBuilder = tagId => ({ tagIds: tagId });

    // filter by tag
    if (tag) {
      query = { ...query, ...tagQueryBuilder(tag) };
    }

    return EngageMessages.find(query);
  },

  engageMessageDetail(root, { _id }) {
    return EngageMessages.findOne({ _id });
  },

  totalEngageMessagesCount() {
    return EngageMessages.find({}).count();
  },
};
