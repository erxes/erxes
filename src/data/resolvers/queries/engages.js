import { EngageMessages, Tags } from '../../../db/models';

// basic count helper
const count = selector => EngageMessages.find(selector).count();

// Tag query builder
const tagQueryBuilder = tagId => ({ tagIds: tagId });

// status query builder
const statusQueryBuilder = (status, user) => {
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
    return { fromUserId: user._id };
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
const countsByStatus = async ({ kind, user }) => {
  const query = {};

  if (kind) {
    query.kind = kind;
  }

  return {
    live: await count({ ...query, ...statusQueryBuilder('live') }),
    draft: await count({ ...query, ...statusQueryBuilder('draft') }),
    paused: await count({ ...query, ...statusQueryBuilder('paused') }),
    yours: await count({ ...query, ...statusQueryBuilder('yours', user) }),
  };
};

// cout for each tag
const countsByTag = async ({ kind, status, user }) => {
  let query = {};

  if (kind) {
    query.kind = kind;
  }

  if (status) {
    query = { ...query, ...statusQueryBuilder(status, user) };
  }

  const tags = await Tags.find({ type: 'engageMessage' });

  const response = {};

  for (let tag of tags) {
    response[tag._id] = await count({ ...query, ...tagQueryBuilder(tag._id) });
  }

  return response;
};

export default {
  /**
   * Group engage messages counts by kind, status, tag
   *
   * @param {Object} args
   * @param {String} args.name
   * @param {String} args.kind
   * @param {String} args.status
   * @return {Object} counts map
   */
  async engageMessageCounts(root, { name, kind, status }, { user }) {
    if (name === 'kind') {
      return countsByKind();
    }

    if (name === 'status') {
      return countsByStatus({ kind, user });
    }

    if (name === 'tag') {
      return countsByTag({ kind, status, user });
    }
  },

  /**
   * Engage messages list
   * @param {Object} args
   * @param {String} args.kind
   * @param {String} args.status
   * @param {String} args.tag
   * @param {[String]} args.ids
   * @return {Promise} filtered messages list by given parameters
   */
  engageMessages(root, { kind, status, tag, ids }, { user }) {
    if (ids) {
      return EngageMessages.find({ _id: { $in: ids } });
    }

    let query = {};

    // filter by kind
    if (kind) {
      query.kind = kind;
    }

    // filter by status
    if (status) {
      query = { ...query, ...statusQueryBuilder(status, user) };
    }

    // filter by tag
    if (tag) {
      query = { ...query, ...tagQueryBuilder(tag) };
    }

    return EngageMessages.find(query);
  },

  /**
   * Get one message
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} found message
   */
  engageMessageDetail(root, { _id }) {
    return EngageMessages.findOne({ _id });
  },

  /**
   * Get all messages count. We will use it in pager
   * @return {Promise} total count
   */
  engageMessagesTotalCount() {
    return EngageMessages.find({}).count();
  },
};
