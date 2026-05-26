import { IContext } from '~/connectionResolvers';
import { IBranch, ISale, ITask } from '~/modules/branched/@types';

interface IMutationResolvers {
  branchesAdd: (
    _root: unknown,
    args: IBranch,
    context: IContext,
  ) => Promise<unknown>;

  branchesEdit: (
    _root: unknown,
    args: { _id: string } & Partial<IBranch>,
    context: IContext,
  ) => Promise<unknown>;

  branchesRemove: (
    _root: unknown,
    args: { _ids: string[] },
    context: IContext,
  ) => Promise<{ n: number; ok: number }>;

  salesAdd: (
    _root: unknown,
    args: ISale,
    context: IContext,
  ) => Promise<unknown>;

  salesEdit: (
    _root: unknown,
    args: { _id: string } & Partial<ISale>,
    context: IContext,
  ) => Promise<unknown>;

  salesRemove: (
    _root: unknown,
    args: { _ids: string[] },
    context: IContext,
  ) => Promise<{ n: number; ok: number }>;

  tasksAdd: (
    _root: unknown,
    args: ITask,
    context: IContext,
  ) => Promise<unknown>;

  tasksEdit: (
    _root: unknown,
    args: { _id: string } & Partial<ITask>,
    context: IContext,
  ) => Promise<unknown>;

  tasksRemove: (
    _root: unknown,
    args: { _ids: string[] },
    context: IContext,
  ) => Promise<{ n: number; ok: number }>;
}

const mutations: IMutationResolvers = {
  branchesAdd: async (_root, args, { models }) => {
    return models.Branches.createBranch(args);
  },

  branchesEdit: async (_root, { _id, ...doc }, { models }) => {
    return models.Branches.updateBranch(_id, doc as IBranch);
  },

  branchesRemove: async (_root, { _ids }, { models }) => {
    return models.Branches.removeBranches(_ids);
  },

  salesAdd: async (_root, args, { models }) => {
    return models.Sales.createSale(args);
  },

  salesEdit: async (_root, { _id, ...doc }, { models }) => {
    return models.Sales.updateSale(_id, doc as ISale);
  },

  salesRemove: async (_root, { _ids }, { models }) => {
    return models.Sales.removeSales(_ids);
  },

  tasksAdd: async (_root, args, { models }) => {
    return models.Tasks.createTask(args);
  },

  tasksEdit: async (_root, { _id, ...doc }, { models }) => {
    return models.Tasks.updateTask(_id, doc as ITask);
  },

  tasksRemove: async (_root, { _ids }, { models }) => {
    return models.Tasks.removeTasks(_ids);
  },
};

export default mutations;
