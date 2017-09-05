import { EngageMessages, Tags } from '../../../db/models';

// basic count helper
const count = selector => EngageMessages.find(selector).count();

// Tag query builder
const tagQueryBuilder = tagId => ({ tagIds: tagId });

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
    return { fromUserId: '' };
  }

  return {};
};

// count for each kind
const countsByKind = async () => ({
  all: await count({}),
  auto: await count({ kind: 'auto' }),
  visitorAuto: await count({ kind: 'visitorAuto' }),
  manual: await count({ kind: 'manual' }),
});

// count for each status type
const countsByStatus = async ({ kind }) => {
  const query = {};

  if (kind) {
    query.kind = kind;
  }

  return {
    live: await count({ ...query, ...statusQueryBuilder('live') }),
    draft: await count({ ...query, ...statusQueryBuilder('draft') }),
    paused: await count({ ...query, ...statusQueryBuilder('paused') }),
    yours: await count({ ...query, ...statusQueryBuilder('yours') }),
  };
};

// cout for each tag
const countsByTag = async ({ kind, status }) => {
  let query = {};

  if (kind) {
    query.kind = kind;
  }

  if (status) {
    query = { ...query, ...statusQueryBuilder(status) };
  }

  const tags = await Tags.find({ type: 'engageMessage' });

  const response = {};

  for (let tag of tags) {
    response[tag._id] = await count({ ...query, ...tagQueryBuilder(tag._id) });
  }

  return response;
};

export default {
  async engageMessageCounts(root, { name, kind, status }) {
    if (name === 'kind') {
      return countsByKind();
    }

    if (name === 'status') {
      return countsByStatus({ kind });
    }

    if (name === 'tag') {
      return countsByTag({ kind, status });
    }
  },

  engageMessages(root, { kind, status, tag }) {
    let query = {};

    // filter by kind
    if (kind) {
      query.kind = kind;
    }

    // filter by status
    if (status) {
      query = { ...query, ...statusQueryBuilder(status) };
    }

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
