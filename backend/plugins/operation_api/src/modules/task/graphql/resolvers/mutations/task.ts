import { IContext } from '~/connectionResolvers';
import { ITaskUpdate } from '@/task/@types/task';
import { graphqlPubsub } from 'erxes-api-shared/utils';

export const taskMutations = {
  createTask: async (
    _parent: undefined,
    params: ITaskUpdate,
    { models, user, subdomain }: IContext,
  ) => {
    const task = await models.Task.createTask({
      doc: params,
      userId: user._id,
      subdomain,
    });

    graphqlPubsub.publish(`operationTaskChanged:${task._id}`, {
      operationTaskChanged: {
        type: 'create',
        task,
      },
    });

    graphqlPubsub.publish('operationTaskListChanged', {
      operationTaskListChanged: {
        type: 'create',
        task,
      },
    });

    return task;
  },

  updateTask: async (
    _parent: undefined,
    params: ITaskUpdate,
    { models, user, subdomain }: IContext,
  ) => {
    const updatedTask = await models.Task.updateTask({
      doc: params,
      userId: user._id,
      subdomain,
    });
    graphqlPubsub.publish(`operationTaskChanged:${updatedTask._id}`, {
      operationTaskChanged: {
        type: 'update',
        task: updatedTask,
      },
    });

    graphqlPubsub.publish('operationTaskListChanged', {
      operationTaskListChanged: {
        type: 'update',
        task: updatedTask,
      },
    });

    return updatedTask;
  },

  removeTask: async (_parent: undefined, { _id }, { models }: IContext) => {
    const deletedTask = await models.Task.removeTask(_id);

    graphqlPubsub.publish(`operationTaskChanged:${_id}`, {
      operationTaskChanged: {
        type: 'delete',
        task: deletedTask,
      },
    });

    graphqlPubsub.publish('operationTaskListChanged', {
      operationTaskListChanged: {
        type: 'delete',
        task: deletedTask,
      },
    });

    return deletedTask;
  },
};
