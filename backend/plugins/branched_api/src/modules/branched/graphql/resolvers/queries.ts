import { IContext } from '~/connectionResolvers';
import { IBranchDocument, ISaleDocument, ITaskDocument } from '~/modules/branched/@types';

interface IQueryResolvers {
  branches: (
    _root: unknown,
    args: {
      isActive?: boolean;
      search?: string;
      ids?: string[];
      excludeIds?: boolean;
      perPage?: number;
      page?: number;
    },
    context: IContext,
  ) => Promise<IBranchDocument[]>;

  branchDetail: (
    _root: unknown,
    args: { _id: string },
    context: IContext,
  ) => Promise<IBranchDocument>;

  branchesTotalCount: (
    _root: unknown,
    _args: unknown,
    context: IContext,
  ) => Promise<number>;

  sales: (
    _root: unknown,
    args: {
      branchId?: string;
      startDate?: Date;
      endDate?: Date;
      search?: string;
      perPage?: number;
      page?: number;
    },
    context: IContext,
  ) => Promise<ISaleDocument[]>;

  saleDetail: (
    _root: unknown,
    args: { _id: string },
    context: IContext,
  ) => Promise<ISaleDocument>;

  salesTotalCount: (
    _root: unknown,
    args: { branchId?: string },
    context: IContext,
  ) => Promise<number>;

  tasks: (
    _root: unknown,
    args: {
      branchId?: string;
      status?: string;
      assigneeId?: string;
      priority?: string;
      startDate?: Date;
      endDate?: Date;
      search?: string;
      perPage?: number;
      page?: number;
    },
    context: IContext,
  ) => Promise<ITaskDocument[]>;

  taskDetail: (
    _root: unknown,
    args: { _id: string },
    context: IContext,
  ) => Promise<ITaskDocument>;

  tasksTotalCount: (
    _root: unknown,
    args: { branchId?: string },
    context: IContext,
  ) => Promise<number>;
}

const queries: IQueryResolvers = {
  branches: async (_root, args, { models }) => {
    const filter: Record<string, unknown> = {};
    if (args.isActive !== undefined) filter.isActive = args.isActive;
    if (args.search) filter.name = { $regex: args.search, $options: 'i' };
    if (args.ids) filter._id = args.excludeIds ? { $nin: args.ids } : { $in: args.ids };
    return models.Branches.find(filter).sort({ order: 1 }).lean();
  },

  branchDetail: async (_root, { _id }, { models }) => {
    return models.Branches.getBranch(_id);
  },

  branchesTotalCount: async (_root, _args, { models }) => {
    return models.Branches.countDocuments();
  },

  sales: async (_root, args, { models }) => {
    const filter: Record<string, unknown> = {};
    if (args.branchId) filter.branchId = args.branchId;
    if (args.startDate || args.endDate) {
      filter.date = {} as Record<string, Date>;
      if (args.startDate) (filter.date as Record<string, Date>).$gte = args.startDate;
      if (args.endDate) (filter.date as Record<string, Date>).$lte = args.endDate;
    }
    return models.Sales.find(filter).sort({ date: -1 }).lean();
  },

  saleDetail: async (_root, { _id }, { models }) => {
    return models.Sales.getSale(_id);
  },

  salesTotalCount: async (_root, args, { models }) => {
    const filter: Record<string, unknown> = {};
    if (args.branchId) filter.branchId = args.branchId;
    return models.Sales.countDocuments(filter);
  },

  tasks: async (_root, args, { models }) => {
    const filter: Record<string, unknown> = {};
    if (args.branchId) filter.branchId = args.branchId;
    if (args.status) filter.status = args.status;
    if (args.assigneeId) filter.assigneeId = args.assigneeId;
    if (args.priority) filter.priority = args.priority;
    if (args.startDate || args.endDate) {
      filter.createdAt = {} as Record<string, Date>;
      if (args.startDate) (filter.createdAt as Record<string, Date>).$gte = args.startDate;
      if (args.endDate) (filter.createdAt as Record<string, Date>).$lte = args.endDate;
    }
    return models.Tasks.find(filter).sort({ createdAt: -1 }).lean();
  },

  taskDetail: async (_root, { _id }, { models }) => {
    return models.Tasks.getTask(_id);
  },

  tasksTotalCount: async (_root, args, { models }) => {
    const filter: Record<string, unknown> = {};
    if (args.branchId) filter.branchId = args.branchId;
    return models.Tasks.countDocuments(filter);
  },
};

export default queries;
