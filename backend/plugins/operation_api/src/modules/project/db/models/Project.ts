import { createActivity } from '@/activity/utils/createActivity';
import {
  IProject,
  IProjectDocument,
  IProjectUpdate,
} from '@/project/@types/project';
import { projectSchema } from '@/project/db/definitions/project';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { Document } from 'mongodb';
import { FlattenMaps, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface IProjectModel extends Model<IProjectDocument> {
  getProject(_id: string): Promise<IProjectDocument>;
  getProjects(
    filter: any,
  ): Promise<FlattenMaps<IProjectDocument>[] | Document[]>;
  createProject(doc: IProject, user: IUserDocument): Promise<IProjectDocument>;
  updateProject({
    doc,
    userId,
  }: {
    doc: IProjectUpdate;
    userId: string;
  }): Promise<FlattenMaps<IProjectDocument> | Document>;
  removeProject(projectId: string): Promise<{ ok: number }>;
}

export const loadProjectClass = (models: IModels, subdomain: string) => {
  class Project {
    public static async getProject(_id: string) {
      const Project = await models.Project.findOne({ _id }).lean();

      if (!Project) {
        throw new Error('Project not found');
      }

      return Project;
    }

    public static async getProjects(
      filter: any,
    ): Promise<FlattenMaps<IProjectDocument>[] | Document[]> {
      return models.Project.find(filter).lean();
    }

    public static async createProject(
      doc: IProject,
      user: IUserDocument,
    ): Promise<FlattenMaps<IProjectDocument> | Document> {
      if (doc.convertedFromId) {
        const task = await models.Task.getTask(doc.convertedFromId);

        doc.convertedFromId = task._id;

        const project = await models.Project.findOne({
          convertedFromId: doc.convertedFromId,
        });

        if (project) {
          throw new Error('Project has been converted already.');
        }
      }

      const project = await models.Project.create(doc);

      if (doc.convertedFromId && project.convertedFromId) {
        models.Activity.createActivity({
          contentId: project.convertedFromId,
          action: 'CONVERTED',
          module: 'CONVERT',
          metadata: {
            newValue: project._id.toString(),
            previousValue: project.convertedFromId?.toString(),
          },
          createdBy: user._id,
        });
      }

      return project;
    }

    public static async updateProject({
      doc,
      userId,
    }: {
      doc: IProjectUpdate;
      userId: string;
    }) {
      const { _id, ...rest } = doc;

      const project = await models.Project.findOne({ _id });

      if (!project) {
        throw new Error('Project not found');
      }

      await createActivity({
        contentType: 'project',
        oldDoc: project,
        newDoc: doc,
        subdomain,
        userId,
        contentId: project._id,
      });

      return await models.Project.findOneAndUpdate(
        { _id },
        { $set: { ...rest } },
        { new: true },
      );
    }

    public static async removeProject(projectId: string) {
      const task = await models.Task.findOne({ projectId });

      if (task) {
        throw new Error('Project has tasks');
      }

      return models.Project.findOneAndDelete({ _id: projectId });
    }
  }

  return projectSchema.loadClass(Project);
};
