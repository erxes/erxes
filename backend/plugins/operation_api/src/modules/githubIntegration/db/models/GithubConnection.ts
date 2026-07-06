import { Model } from 'mongoose';
import {
  IGithubConnection,
  IGithubConnectionDocument,
} from '../../@types/githubConnection';
import { IModels } from '~/connectionResolvers';
import { githubConnectionSchema } from '../definitions/githubConnection';

export interface IGithubConnectionModel extends Model<IGithubConnectionDocument> {
  upsertConnection(
    connection: IGithubConnection,
  ): Promise<IGithubConnectionDocument>;
}

export const loadGithubConnectionClass = (models: IModels) => {
  class GithubConnectionClass {
    public static async upsertConnection(connection: IGithubConnection) {
      const existingConnection = await models.GithubConnection.findOne({
        installationId: connection.installationId,
        subdomain: connection.subdomain,
      });
      if (existingConnection) {
        Object.assign(existingConnection, connection);
        return existingConnection.save();
      } else {
        const newConnection = new models.GithubConnection(connection);
        return newConnection.save();
      }
    }
  }
  githubConnectionSchema.loadClass(GithubConnectionClass);
  return githubConnectionSchema;
};
