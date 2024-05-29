import { Model } from 'mongoose';
import { IModels } from '../../connectionResolver';
import {
  IOnboardingHistoryDocument,
  IRobotEntryDocument,
  onboardingHistorySchema,
  robotEntrySchema
} from './definitions/robot';
import { IUserDocument } from './definitions/users';

// entries ==========================
export interface IRobotEntryModel extends Model<IRobotEntryDocument> {
  createEntry(data): Promise<IRobotEntryDocument | undefined>;
  markAsNotified(_id: string): Promise<IRobotEntryDocument>;
  updateOrCreate(action: string, data): Promise<IRobotEntryDocument>;
}

export const loadRobotClass = (models: IModels) => {
  class RobotEntry {
    public static async updateOrCreate(
      action: string,
      data
    ): Promise<IRobotEntryDocument> {
      return models.RobotEntries.findOneAndUpdate(
        { action, data },
        { isNotified: false },
        { new: true, upsert: true }
      );
    }

    public static async markAsNotified(
      _id: string
    ): Promise<IRobotEntryDocument> {
      return models.RobotEntries.updateOne({ _id }, { $set: { isNotified: true } });
    }

    public static async createEntry(
      data
    ): Promise<IRobotEntryDocument | undefined> {
      if (data.action === 'channelsWithoutIntegration') {
        return models.RobotEntries.updateOrCreate('channelsWithoutIntegration', {
          channelIds: data.channelIds
        });
      }

      if (data.action === 'channelsWithoutMembers') {
        return models.RobotEntries.updateOrCreate('channelsWithoutMembers', {
          channelIds: data.channelIds
        });
      }

      if (data.action === 'brandsWithoutIntegration') {
        return models.RobotEntries.updateOrCreate('brandsWithoutIntegration', {
          brandIds: data.brandIds
        });
      }

      if (data.action === 'featureSuggestion') {
        return models.RobotEntries.updateOrCreate('featureSuggestion', {
          message: data.message
        });
      }
    }
  }

  robotEntrySchema.loadClass(RobotEntry);

  return robotEntrySchema;
};

// onboarding ==========================
interface IGetOrCreateDoc {
  type: string;
  user: IUserDocument;
}

interface IGetOrCreateResponse {
  status: string;
  entry: IOnboardingHistoryDocument;
}

interface IStepsCompletenessResponse {
  [key: string]: boolean;
}

export interface IOnboardingHistoryModel
  extends Model<IOnboardingHistoryDocument> {
  getOrCreate(doc: IGetOrCreateDoc): Promise<IGetOrCreateResponse>;
  stepsCompletness(
    steps: string[],
    user: IUserDocument
  ): IStepsCompletenessResponse;
  completeShowStep(step: string, userId: string): void;
  forceComplete(userId: string): void;
  userStatus(userId: string): string;
}

export const loadOnboardingHistoryClass = (models: IModels) => {
  class OnboardingHistory {
    public static async getOrCreate({
      type,
      user
    }: IGetOrCreateDoc): Promise<IGetOrCreateResponse> {
      const prevEntry = await models.OnboardingHistories.findOne({ userId: user._id });

      if (!prevEntry) {
        const entry = await models.OnboardingHistories.create({
          userId: user._id,
          completedSteps: [type]
        });
        return { status: 'created', entry };
      }

      if (prevEntry.completedSteps.includes(type)) {
        return { status: 'prev', entry: prevEntry };
      }

      const updatedEntry = await models.OnboardingHistories.updateOne(
        { userId: user._id },
        { $push: { completedSteps: type } }
      );

      return { status: 'created', entry: updatedEntry };
    }

    public static async stepsCompletness(
      steps: string[],
      user: IUserDocument
    ): Promise<IStepsCompletenessResponse> {
      const result: IStepsCompletenessResponse = {};

      for (const step of steps) {
        const selector = { userId: user._id, completedSteps: { $in: [step] } };
        result[step] =
          (await models.OnboardingHistories.find(selector).countDocuments()) > 0;
      }

      return result;
    }

    public static async forceComplete(
      userId: string
    ): Promise<IOnboardingHistoryDocument> {
      const entry = await models.OnboardingHistories.findOne({ userId });

      if (!entry) {
        return models.OnboardingHistories.create({ userId, isCompleted: true });
      }

      return models.OnboardingHistories.updateOne(
        { userId },
        { $set: { isCompleted: true } }
      );
    }

    public static async completeShowStep(
      step: string,
      userId: string
    ): Promise<void> {
      return models.OnboardingHistories.updateOne(
        { userId },
        { $push: { completedSteps: step } },
        { upsert: true }
      );
    }

    public static async userStatus(userId: string): Promise<string> {
      const entries = await models.OnboardingHistories.find({ userId });
      const completed = entries.find(item => item.isCompleted);

      if (completed) {
        return 'completed';
      }

      if (entries.length > 0) {
        return 'inComplete';
      }

      return 'initial';
    }
  }

  onboardingHistorySchema.loadClass(OnboardingHistory);

  return onboardingHistorySchema;
};