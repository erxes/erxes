import { EngageMessages, Tags } from '../../../db/models';
import { IUserDocument } from '../../../db/models/definitions/users';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { paginate } from '../../utils';

interface IListArgs {
  kind?: string;
  status?: string;
  tag?: string;
  ids?: string[];
  brandIds?: string[];
  segmentIds?: string[];
  tagIds?: string[];
  page?: number;
  perPage?: number;
}

interface IQuery {
  kind?: string;
}

interface IStatusQueryBuilder {
  [index: string]: boolean | string;
}

interface ICountsByStatus {
  [index: string]: number;
}

interface ICountsByTag {
  [index: string]: number;
}

// basic count helper
const count = async (selector: {}): Promise<number> => {
  const res = await EngageMessages.find(selector).countDocuments();
  return Number(res);
};

// Tag query builder
const tagQueryBuilder = (tagId: string) => ({ tagIds: tagId });

// status query builder
const statusQueryBuilder = (
  status: string,
  user?: IUserDocument
): IStatusQueryBuilder | undefined => {
  if (status === 'live') {
    return { isLive: true };
  }

  if (status === 'draft') {
    return { isDraft: true };
  }

  if (status === 'yours' && user) {
    return { fromUserId: user._id };
  }

  // status is 'paused'
  return { isLive: false };
};

// count for each kind
const countsByKind = async commonSelector => ({
  all: await count(commonSelector),
  auto: await count({ ...commonSelector, kind: 'auto' }),
  visitorAuto: await count({ ...commonSelector, kind: 'visitorAuto' }),
  manual: await count({ ...commonSelector, kind: 'manual' })
});

// count for each status type
const countsByStatus = async (
  commonSelector,
  { kind, user }: { kind: string; user: IUserDocument }
): Promise<ICountsByStatus> => {
  const query: IQuery = commonSelector;

  if (kind) {
    query.kind = kind;
  }

  return {
    live: await count({ ...query, ...statusQueryBuilder('live') }),
    draft: await count({ ...query, ...statusQueryBuilder('draft') }),
    paused: await count({ ...query, ...statusQueryBuilder('paused') }),
    yours: await count({ ...query, ...statusQueryBuilder('yours', user) })
  };
};

// cout for each tag
const countsByTag = async (
  commonSelector,
  {
    kind,
    status,
    user
  }: {
    kind: string;
    status: string;
    user: IUserDocument;
  }
): Promise<ICountsByTag[]> => {
  let query: any = commonSelector;

  if (kind) {
    query.kind = kind;
  }

  if (status) {
    query = { ...query, ...statusQueryBuilder(status, user) };
  }

  const tags = await Tags.find({ type: 'engageMessage' });

  // const response: {[name: string]: number} = {};
  const response: ICountsByTag[] = [];

  for (const tag of tags) {
    response[tag._id] = await count({ ...query, ...tagQueryBuilder(tag._id) });
  }

  return response;
};

/*
 * List filter
 */
const listQuery = (
  commonSelector,
  { segmentIds, brandIds, tagIds, kind, status, tag, ids }: IListArgs,
  user: IUserDocument
): any => {
  if (ids) {
    return EngageMessages.find({ ...commonSelector, _id: { $in: ids } });
  }

  if (segmentIds) {
    return EngageMessages.find({
      ...commonSelector,
      segmentIds: { $in: segmentIds }
    });
  }

  if (brandIds) {
    return EngageMessages.find({
      ...commonSelector,
      brandIds: { $in: brandIds }
    });
  }

  if (tagIds) {
    return EngageMessages.find({ ...commonSelector, tagIds: { $in: tagIds } });
  }

  let query = commonSelector;

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

  return query;
};

const engageQueries = {
  /**
   * Group engage messages counts by kind, status, tag
   */
  engageMessageCounts(
    _root,
    { name, kind, status }: { name: string; kind: string; status: string },
    { user, commonQuerySelector }: IContext
  ) {
    if (name === 'kind') {
      return countsByKind(commonQuerySelector);
    }

    if (name === 'status') {
      return countsByStatus(commonQuerySelector, { kind, user });
    }

    return countsByTag(commonQuerySelector, { kind, status, user });
  },

  /**
   * Engage messages list
   */
  engageMessages(
    _root,
    args: IListArgs,
    { user, commonQuerySelector }: IContext
  ) {
    return paginate(
      EngageMessages.find(listQuery(commonQuerySelector, args, user)).sort({
        createdAt: -1
      }),
      args
    );
  },

  /**
   * Get one message
   */
  engageMessageDetail(_root, { _id }: { _id: string }) {
    return EngageMessages.findOne({ _id });
  },

  /**
   * Config detail
   */
  engagesConfigDetail(_root, _args, { dataSources }: IContext) {
    return dataSources.EngagesAPI.engagesConfigDetail();
  },

  engageReportsList(_root, params, { dataSources }: IContext) {
    return dataSources.EngagesAPI.engageReportsList(params);
  },

  /**
   * Get all messages count. We will use it in pager
   */
  engageMessagesTotalCount(
    _root,
    args: IListArgs,
    { user, commonQuerySelector }: IContext
  ) {
    return EngageMessages.find(
      listQuery(commonQuerySelector, args, user)
    ).countDocuments();
  },

  /**
   * Get all verified emails
   */
  engageVerifiedEmails(_root, _args, { dataSources }: IContext) {
    return dataSources.EngagesAPI.engagesGetVerifiedEmails();
  }
};

requireLogin(engageQueries, 'engageMessagesTotalCount');
requireLogin(engageQueries, 'engageMessageCounts');
requireLogin(engageQueries, 'engageMessageDetail');

checkPermission(engageQueries, 'engageMessages', 'showEngagesMessages', []);

export default engageQueries;
