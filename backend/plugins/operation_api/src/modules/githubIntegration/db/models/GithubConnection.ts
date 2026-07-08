import { Model } from 'mongoose';
import {
  IGithubConnection,
  IGithubConnectionDocument,
} from '../../@types/githubConnection';
import { IModels } from '~/connectionResolvers';
import { githubConnectionSchema } from '../definitions/githubConnection';
import { isDuplicateKeyError } from '~/utils/mongoErrors';

export interface IGithubConnectionModel extends Model<IGithubConnectionDocument> {
  upsertConnection(
    connection: IGithubConnection,
  ): Promise<IGithubConnectionDocument>;
}

export const loadGithubConnectionClass = (models: IModels) => {
  class GithubConnectionClass {
    public static async upsertConnection(connection: IGithubConnection) {
      try {
        return await models.GithubConnection.findOneAndUpdate(
          {
            installationId: connection.installationId,
            subdomain: connection.subdomain,
          },
          { $set: connection },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        );
      } catch (error) {
        if (isDuplicateKeyError(error)) {
          return models.GithubConnection.findOneAndUpdate(
            {
              installationId: connection.installationId,
              subdomain: connection.subdomain,
            },
            { $set: connection },
            { new: true },
          );
        }
        throw error;
      }
    }
  }
  githubConnectionSchema.loadClass(GithubConnectionClass);
  return githubConnectionSchema;
};
