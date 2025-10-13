import { createActivity } from '@/activity/utils/createActivity';
import { STATUS_TYPES } from '@/status/constants/types';
import {
  ITask,
  ITaskDocument,
  ITaskFilter,
  ITaskUpdate,
} from '@/task/@types/task';
import { taskSchema } from '@/task/db/definitions/task';
import { Document } from 'mongodb';
import { FilterQuery, FlattenMaps, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IProject, IProjectDocument } from '~/modules/project/@types/project';
import { createNotifications } from '~/utils/notifications';

export interface ITaskModel extends Model<ITaskDocument> {
  getTask(_id: string): Promise<ITaskDocument>;
  getTasks(
    params: ITaskFilter,
  ): Promise<FlattenMaps<ITaskDocument>[] | Document[]>;
  createTask({
    doc,
    userId,
    subdomain,
  }: {
    doc: ITask;
    userId: string;
    subdomain: string;
  }): Promise<ITaskDocument>;
  updateTask({
    doc,
    userId,
    subdomain,
  }: {
    doc: ITaskUpdate;
    userId: string;
    subdomain: string;
  }): Promise<ITaskDocument>;
  removeTask(taskId: string): Promise<{ ok: number }>;
  moveCycle(cycleId: string, newCycleId: string): Promise<{ ok: number }>;
  convertToProject({ taskId }: { taskId: string }): Promise<IProjectDocument>;
}

export const loadTaskClass = (models: IModels) => {
  class Task {
    public static async getTask(_id: string) {
      const Task = await models.Task.findOne({ _id }).lean();

      if (!Task) {
        throw new Error('Task not found');
      }

      return Task;
    }

    public static async getTasks(
      params: ITaskFilter,
    ): Promise<FlattenMaps<ITaskDocument>[] | Document[]> {
      const query = {} as FilterQuery<ITaskDocument>;

      if (params.assigneeId) {
        query.assigneeId = params.assigneeId;
      }

      if (params.name) {
        query.name = { $regex: params.name };
      }

      if (params.status) {
        query.status = params.status;
      }

      if (params.priority) {
        query.priority = params.priority;
      }

      if (params.labelIds) {
        query.labelIds = { $in: params.labelIds };
      }

      if (params.tagIds) {
        query.tagIds = { $in: params.tagIds };
      }

      if (params.cycleId) {
        query.cycleId = params.cycleId;
      }

      if (params.projectId) {
        query.projectId = params.projectId;
      }

      if (params.milestoneId) {
        query.milestoneId = params.milestoneId;
      }

      if (params.createdAt) {
        query.createdAt = { $gte: params.createdAt };
      }

      return models.Task.find(query).lean();
    }

    public static async createTask({
      doc,
      userId,
      subdomain,
    }: {
      doc: ITask;
      userId: string;
      subdomain: string;
    }): Promise<ITaskDocument> {
      const [result] = await models.Task.aggregate([
        { $match: { teamId: doc.teamId } },
        { $group: { _id: null, maxNumber: { $max: '$number' } } },
      ]);

      const nextNumber = (result?.maxNumber || 0) + 1;

      const status = await models.Status.getStatus(doc.status || '');

      doc.statusType = status.type;

      if (doc.projectId && doc.teamId) {
        const project = await models.Project.findOne({ _id: doc.projectId });

        if (project && !project.teamIds.includes(doc.teamId)) {
          throw new Error('Task project is not in this team');
        }
      }

      if (doc.cycleId) {
        const cycle = await models.Cycle.findOne({ _id: doc.cycleId });

        if (cycle && cycle.isCompleted) {
          throw new Error('Cannot add task to completed cycle');
        }
      }

      doc.createdBy = userId;

      const task = await models.Task.insertOne({
        ...doc,
        number: nextNumber,
      });

      if (doc.assigneeId && doc.assigneeId !== userId) {
        await createNotifications({
          contentType: 'task',
          contentTypeId: task._id,
          fromUserId: userId,
          subdomain,
          notificationType: 'taskAssignee',
          userIds: [doc.assigneeId],
          action: 'assignee',
        });
      }

      return task;
    }

    public static async updateTask({
      doc,
      userId,
      subdomain,
    }: {
      doc: ITaskUpdate;
      userId: string;
      subdomain: string;
    }) {
      const { _id, ...rest } = doc;

      const task = await models.Task.findOne({ _id });

      if (!task) {
        throw new Error('Task not found');
      }

      if (doc.status && doc.status !== task.status) {
        rest.statusChangedDate = new Date();
        const status = await models.Status.getStatus(doc.status || '');
        rest.statusType = status.type;
      }

      if (task.projectId && doc.teamId && doc.teamId !== task.teamId) {
        const project = await models.Project.findOne({ _id: task.projectId });

        if (project && !project.teamIds.includes(doc.teamId)) {
          throw new Error('Task project is not in this team');
        }
      }

      if (
        task.teamId &&
        doc.teamId &&
        task.teamId !== doc.teamId &&
        task.projectId
      ) {
        const project = await models.Project.findOne({ _id: task.projectId });

        if (project && !project.teamIds.includes(doc.teamId)) {
          throw new Error('Task project is not in this team');
        }
      }

      if (doc.teamId && doc.teamId !== task.teamId) {
        const [result] = await models.Task.aggregate([
          { $match: { teamId: doc.teamId } },
          { $group: { _id: null, maxNumber: { $max: '$number' } } },
        ]);

        const status = await models.Status.getStatus(task.status || '');

        const newStatus = await models.Status.findOne({
          teamId: doc.teamId,
          type: status.type,
        });

        await models.Activity.deleteMany({
          contentId: task._id,
          module: 'STATUS',
        });

        const nextNumber = (result?.maxNumber || 0) + 1;

        rest.number = nextNumber;
        rest.status = newStatus?._id;
        rest.cycleId = '';
      }

      await createActivity({
        contentType: 'task',
        oldDoc: task,
        newDoc: doc,
        subdomain,
        userId,
        contentId: task._id,
      });

      if (doc.assigneeId && doc.assigneeId !== userId) {
        await createNotifications({
          contentType: 'task',
          contentTypeId: task._id,
          fromUserId: userId,
          subdomain,
          notificationType: 'note',
          userIds: [doc.assigneeId],
          action: 'assignee',
        });
      }

      return models.Task.findOneAndUpdate(
        { _id },
        { $set: { ...rest } },
        { new: true },
      );
    }

    public static async removeTask(TaskId: string[]) {
      return models.Task.findOneAndDelete({ _id: { $in: TaskId } });
    }

    public static async moveCycle(cycleId: string, newCycleId: string) {
      const taskIds = await models.Task.find({
        cycleId,
        statusType: { $nin: [STATUS_TYPES.COMPLETED, STATUS_TYPES.COMPLETED] },
      }).distinct('_id');

      for (const taskId of taskIds) {
        await models.Activity.createActivity({
          action: 'CHANGED',
          contentId: taskId,
          module: 'CYCLE',
          metadata: {
            newValue: newCycleId,
            previousValue: cycleId,
          },
          createdBy: 'system',
        });
      }

      await models.Task.updateMany(
        { _id: { $in: taskIds } },
        { $set: { cycleId: newCycleId, statusChangedDate: new Date() } },
      );

      return taskIds;
    }

    public static async convertToProject(taskId: string) {
      const task = await models.Task.getTask(taskId);

      const project: IProject = {
        name: task.name,
        description: task?.description,
        teamIds: [task.teamId],
        priority: task.priority || 0,
        startDate: task.startDate,
        targetDate: task.targetDate,
        leadId: task.assigneeId,
        status: 0,
      };

      if (task.status) {
        const { type } = await models.Status.getStatus(task.status);

        project.status = type;
      }

      return await models.Project.createProject(project);
    }
  }

  taskSchema.loadClass(Task);

  return taskSchema;
};
