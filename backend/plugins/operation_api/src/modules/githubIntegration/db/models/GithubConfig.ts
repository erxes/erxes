import { Model } from 'mongoose';
import {
  IGithubConfig,
  IGithubConfigDocument,
} from '../../@types/githubConfig';
import { IModels } from '~/connectionResolvers';
import { githubConfigSchema } from '../definitions/githubConfig';
import { isDuplicateKeyError } from '~/utils/mongoErrors';

export interface IGithubConfigModel extends Model<IGithubConfigDocument> {
  findByTeam(
    teamId: string,
    subdomain: string,
  ): Promise<IGithubConfigDocument | null>;
  upsertConfig(config: IGithubConfig): Promise<IGithubConfigDocument | null>;
}

export const loadGithubConfigClass = (models: IModels) => {
  class GithubConfigClass {
    public static async findByTeam(teamId: string, subdomain: string) {
      return models.GithubConfig.findOne({
        teamId,
        subdomain,
      }).lean();
    }

    public static async upsertConfig(config: IGithubConfig) {
      try {
        return await models.GithubConfig.findOneAndUpdate(
          {
            teamId: config.teamId,
            subdomain: config.subdomain,
          },
          { $set: config },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        );
      } catch (error) {
        if (isDuplicateKeyError(error)) {
          return models.GithubConfig.findOneAndUpdate(
            {
              teamId: config.teamId,
              subdomain: config.subdomain,
            },
            { $set: config },
            { new: true },
          );
        }
        throw error;
      }
    }
  }

  githubConfigSchema.loadClass(GithubConfigClass);
  return githubConfigSchema;
};
