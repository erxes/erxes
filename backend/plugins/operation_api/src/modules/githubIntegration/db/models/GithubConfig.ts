import { Model } from 'mongoose';
import {
  IGithubConfig,
  IGithubConfigDocument,
} from '../../@types/githubConfig';
import { IModels } from '~/connectionResolvers';
import { githubConfigSchema } from '../definitions/githubConfig';

export interface IGithubConfigModel extends Model<IGithubConfigDocument> {
  findByTeam(
    teamId: string,
    subdomain: string,
  ): Promise<IGithubConfigDocument | null>;
  upsertConfig(config: IGithubConfig): Promise<IGithubConfigDocument>;
}

export const loadGithubConfigClass = (models: IModels) => {
  class GithubConfigClass {
    public static async findByTeam(teamId: string, subdomain: string) {
      const config = await models.GithubConfig.findOne({
        teamId,
        subdomain,
      }).lean();

      if (!config) {
        return null;
      }

      return config;
    }

    public static async upsertConfig(config: IGithubConfig) {
      const existingConfig = await models.GithubConfig.findOne({
        teamId: config.teamId,
      });
      if (existingConfig) {
        Object.assign(existingConfig, config);
        return existingConfig.save();
      } else {
        const newConfig = new models.GithubConfig(config);
        return newConfig.save();
      }
    }
  }

  githubConfigSchema.loadClass(GithubConfigClass);
  return githubConfigSchema;
};
