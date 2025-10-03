import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { projectSchema } from '@/project/db/definitions/project';
import {
  IProject,
  IProjectDocument,
  IProjectUpdate,
} from '@/project/@types/project';
import { createActivity } from '@/activity/utils/createActivity';
import { Document } from 'mongodb';
import { FlattenMaps } from 'mongoose';

export interface IProjectModel extends Model<IProjectDocument> {
  getProject(_id: string): Promise<IProjectDocument>;
  getProjects(
    filter: any,
  ): Promise<FlattenMaps<IProjectDocument>[] | Document[]>;
  createProject(doc: IProject): Promise<IProjectDocument>;
  updateProject({
    doc,
    userId,
    subdomain,
  }: {
    doc: IProjectUpdate;
    userId: string;
    subdomain: string;
  }): Promise<FlattenMaps<IProjectDocument> | Document>;
  removeProject(projectId: string): Promise<{ ok: number }>;
}

export const loadProjectClass = (models: IModels) => {
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
    ): Promise<FlattenMaps<IProjectDocument> | Document> {
      return models.Project.insertOne(doc);
    }

    public static async updateProject({
      doc,
      userId,
      subdomain,
    }: {
      doc: IProjectUpdate;
      userId: string;
      subdomain: string;
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
