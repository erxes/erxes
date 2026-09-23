import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { isDuplicateKeyError } from '~/utils/mongoErrors';
import {
  IGithubMilestoneMapping,
  IGithubMilestoneMappingDocument,
} from '../../@types/githubMilestoneMapping';
import { githubMilestoneMappingSchema } from '../definitions/githubMilestoneMapping';

export interface IGithubMilestoneMappingModel
  extends Model<IGithubMilestoneMappingDocument> {
  upsertMapping(
    mapping: IGithubMilestoneMapping,
  ): Promise<IGithubMilestoneMappingDocument | null>;
}

export const loadGithubMilestoneMappingClass = (models: IModels) => {
  class GithubMilestoneMappingClass {
    public static async upsertMapping(mapping: IGithubMilestoneMapping) {
      const selector = {
        subdomain: mapping.subdomain,
        installationId: mapping.installationId,
        repoName: mapping.repoName,
        erxesMilestoneId: mapping.erxesMilestoneId,
      };

      try {
        return await models.GithubMilestoneMapping.findOneAndUpdate(
          selector,
          { $set: mapping },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        );
      } catch (error) {
        if (isDuplicateKeyError(error)) {
          return models.GithubMilestoneMapping.findOne(selector);
        }

        throw error;
      }
    }
  }

  githubMilestoneMappingSchema.loadClass(GithubMilestoneMappingClass);
  return githubMilestoneMappingSchema;
};
