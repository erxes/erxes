//tslint:disable
import { withFilter } from 'graphql-subscriptions';

export default {
  name: 'operation',
  typeDefs: `
      operationTaskChanged(_id: String!): TaskSubscription
      operationProjectChanged(_id: String!): ProjectSubscription
      operationTaskListChanged(filter: ITaskFilter): TaskSubscription
      operationProjectListChanged(filter: IProjectFilter): ProjectSubscription
      operationActivityChanged(contentId: String!): OperationActivitySubscription

		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      operationActivityChanged: {
        resolve: (payload) => payload.operationActivityChanged,
        subscribe: (_, { contentId }) =>
          graphqlPubsub.asyncIterator(`operationActivityChanged:${contentId}`),
      },

      operationTaskChanged: {
        resolve: (payload) => payload.operationTaskChanged,
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`operationTaskChanged:${_id}`),
      },
      operationProjectChanged: {
        resolve: (payload) => payload.operationProjectChanged,
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`operationProjectChanged:${_id}`),
      },

      operationTaskListChanged: {
        resolve: (payload) => payload.operationTaskListChanged,
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('operationTaskListChanged'),
          async (payload, variables) => {
            const task = payload.operationTaskListChanged.task;
            const filter = variables.filter || {};

            if (!filter) return true;

            if (filter._id && task._id === filter._id) {
              return true;
            }

            if (filter.name) {
              const regex = new RegExp(filter.name, 'i');
              if (!regex.test(task.name)) return false;
            }

            if (filter.status && task.status !== filter.status) return false;
            if (filter.priority && task.priority !== filter.priority)
              return false;

            if (
              filter.startDate &&
              new Date(task.startDate) < new Date(filter.startDate)
            )
              return false;

            if (
              filter.targetDate &&
              new Date(task.targetDate) < new Date(filter.targetDate)
            )
              return false;

            if (
              filter.createdAt &&
              new Date(task.createdAt) < new Date(filter.createdAt)
            )
              return false;

            if (filter.teamId && task.teamId !== filter.teamId) return false;
            if (filter.createdBy && task.createdBy !== filter.createdBy)
              return false;
            if (filter.assigneeId && task.assigneeId !== filter.assigneeId)
              return false;
            if (filter.cycleId && task.cycleId !== filter.cycleId) return false;
            if (filter.projectId && task.projectId !== filter.projectId)
              return false;
            if (
              filter.estimatePoint &&
              task.estimatePoint !== filter.estimatePoint
            )
              return false;

            if (
              filter.userId &&
              !filter.teamId &&
              !filter.assigneeId &&
              !filter.projectId &&
              task.assigneeId !== filter.userId
            ) {
              return false;
            }

            return true;
          },
        ),
      },

      operationProjectListChanged: {
        resolve: (payload) => payload.operationProjectListChanged,
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('operationProjectListChanged'),
          async (payload, variables) => {
            const project = payload.operationProjectListChanged.project;
            const filter = variables.filter || {};

            if (!filter) return true;

            if (filter._id && project._id === filter._id) {
              return true;
            }

            if (filter.name) {
              const regex = new RegExp(filter.name, 'i');
              if (!regex.test(project.name)) return false;
            }

            if (filter.status && project.status !== filter.status) return false;
            if (filter.priority && project.priority !== filter.priority)
              return false;

            if (
              filter.startDate &&
              new Date(project.startDate) < new Date(filter.startDate)
            )
              return false;

            if (
              filter.targetDate &&
              new Date(project.targetDate) < new Date(filter.targetDate)
            )
              return false;

            if (
              filter.createdAt &&
              new Date(project.createdAt) < new Date(filter.createdAt)
            )
              return false;

            if (filter.teamId && !project.teamIds.includes(filter.teamId)) {
              return false;
            }
            if (filter.createdBy && project.createdBy !== filter.createdBy)
              return false;
            if (filter.leadId && project.leadId !== filter.leadId) return false;

            return true;
          },
        ),
      },
    };
  },
};
