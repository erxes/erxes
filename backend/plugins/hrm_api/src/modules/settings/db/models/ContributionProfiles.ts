import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  IContributionProfile,
  IContributionProfileDocument,
} from '../../@types/contributionProfile';
import { contributionProfileSchema } from '../definitions/contributionProfile';

export type ContributionProfileInput = Omit<
  IContributionProfile,
  'createdAt' | 'updatedAt'
>;

export type ContributionProfileListParams = {
  status?: string;
  searchValue?: string;
  page?: number;
  perPage?: number;
};

export interface IContributionProfileModel
  extends Model<IContributionProfileDocument> {
  getContributionProfile(_id: string): Promise<IContributionProfileDocument>;
  getContributionProfileByCode(
    code: string,
  ): Promise<IContributionProfileDocument | null>;
  createContributionProfile(
    doc: ContributionProfileInput,
  ): Promise<IContributionProfileDocument>;
  updateContributionProfile(
    _id: string,
    doc: Partial<ContributionProfileInput>,
  ): Promise<IContributionProfileDocument | null>;
  removeContributionProfile(_id: string): Promise<string>;
  archiveContributionProfile(
    _id: string,
  ): Promise<IContributionProfileDocument | null>;
}

const buildSelector = ({
  status,
  searchValue,
}: ContributionProfileListParams): FilterQuery<IContributionProfileDocument> => {
  const selector: FilterQuery<IContributionProfileDocument> = {};

  if (status) {
    selector.status = status;
  }

  if (searchValue) {
    selector.$or = [
      { code: { $regex: searchValue, $options: 'i' } },
      { name: { $regex: searchValue, $options: 'i' } },
    ];
  }

  return selector;
};

export const contributionProfileSelector = buildSelector;

export const loadContributionProfileClass = (
  models: IModels,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
  class ContributionProfileClass {
    public static async getContributionProfile(_id: string) {
      const profile = await models.ContributionProfiles.findOne({ _id }).lean();

      if (!profile) {
        throw new Error('Contribution profile not found');
      }

      return profile;
    }

    public static async getContributionProfileByCode(code: string) {
      return models.ContributionProfiles.findOne({ code }).lean();
    }

    public static async createContributionProfile(
      doc: ContributionProfileInput,
    ) {
      const now = new Date();
      const created = await models.ContributionProfiles.create({
        ...doc,
        createdAt: now,
        updatedAt: now,
      });

      sendDbEventLog({
        action: 'create',
        docId: created._id,
        currentDocument: created.toObject(),
      });

      return created;
    }

    public static async updateContributionProfile(
      _id: string,
      doc: Partial<ContributionProfileInput>,
    ) {
      const oldProfile =
        await models.ContributionProfiles.getContributionProfile(_id);

      await models.ContributionProfiles.updateOne(
        { _id },
        { $set: { ...doc, updatedAt: new Date() } },
      );

      const updated = await models.ContributionProfiles.findOne({ _id });

      sendDbEventLog({
        action: 'update',
        docId: _id,
        currentDocument: updated?.toObject(),
        prevDocument: oldProfile,
      });

      return updated;
    }

    public static async archiveContributionProfile(_id: string) {
      return models.ContributionProfiles.updateContributionProfile(_id, {
        status: 'archived',
      });
    }

    public static async removeContributionProfile(_id: string) {
      const oldProfile =
        await models.ContributionProfiles.getContributionProfile(_id);

      await models.ContributionProfiles.deleteOne({ _id });

      sendDbEventLog({
        action: 'delete',
        docId: oldProfile._id,
      });

      return 'success';
    }
  }

  contributionProfileSchema.loadClass(ContributionProfileClass);

  return contributionProfileSchema;
};
