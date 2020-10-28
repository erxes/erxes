import { Model, model } from 'mongoose';
import { Companies, Customers } from '.';
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

export const loadClass = () => {
  class RobotEntry {
    public static async updateOrCreate(
      action: string,
      data
    ): Promise<IRobotEntryDocument> {
      return RobotEntries.findOneAndUpdate(
        { action, data },
        { isNotified: false },
        { new: true, upsert: true }
      );
    }

    public static async markAsNotified(
      _id: string
    ): Promise<IRobotEntryDocument> {
      return RobotEntries.updateOne({ _id }, { $set: { isNotified: true } });
    }

    public static async createEntry(
      data
    ): Promise<IRobotEntryDocument | undefined> {
      if (data.action === 'mergeCustomers') {
        const customerIds = data.customerIds;
        const randomCustomer = await Customers.findOne({
          _id: { $in: customerIds }
        }).lean();

        if (randomCustomer) {
          delete randomCustomer._id;
          await Customers.mergeCustomers(customerIds, randomCustomer);
          return RobotEntries.create({
            action: 'mergeCustomers',
            data: { customerIds }
          });
        }
      }

      if (data.action === 'fillCompanyInfo') {
        const results = data.results;

        const parent = await RobotEntries.create({
          action: 'fillCompanyInfo',
          data: { count: results.length }
        });

        for (const result of results) {
          const { _id, modifier } = result;

          await Companies.updateOne({ _id }, { $set: modifier });
          return RobotEntries.create({
            action: 'fillCompanyInfo',
            parentId: parent._id,
            data: { _id, modifier }
          });
        }

        return parent;
      }

      if (data.action === 'customerScoring') {
        const { scoreMap } = data;

        if (!scoreMap || scoreMap.length === 0) {
          return undefined;
        }

        const modifier = scoreMap.map(entry => ({
          updateOne: {
            filter: {
              _id: entry._id
            },
            update: {
              $set: { profileScore: entry.score }
            }
          }
        }));

        await Customers.bulkWrite(modifier);

        return RobotEntries.create({
          action: 'customerScoring',
          data: { scoreMap }
        });
      }

      if (data.action === 'channelsWithoutIntegration') {
        return RobotEntries.updateOrCreate('channelsWithoutIntegration', {
          channelIds: data.channelIds
        });
      }

      if (data.action === 'channelsWithoutMembers') {
        return RobotEntries.updateOrCreate('channelsWithoutMembers', {
          channelIds: data.channelIds
        });
      }

      if (data.action === 'brandsWithoutIntegration') {
        return RobotEntries.updateOrCreate('brandsWithoutIntegration', {
          brandIds: data.brandIds
        });
      }

      if (data.action === 'featureSuggestion') {
        return RobotEntries.updateOrCreate('featureSuggestion', {
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

export const loadOnboardingHistoryClass = () => {
  class OnboardingHistory {
    public static async getOrCreate({
      type,
      user
    }: IGetOrCreateDoc): Promise<IGetOrCreateResponse> {
      const prevEntry = await OnboardingHistories.findOne({ userId: user._id });

      if (!prevEntry) {
        const entry = await OnboardingHistories.create({
          userId: user._id,
          completedSteps: [type]
        });
        return { status: 'created', entry };
      }

      if (prevEntry.completedSteps.includes(type)) {
        return { status: 'prev', entry: prevEntry };
      }

      const updatedEntry = await OnboardingHistories.updateOne(
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
          (await OnboardingHistories.find(selector).countDocuments()) > 0;
      }

      return result;
    }

    public static async forceComplete(
      userId: string
    ): Promise<IOnboardingHistoryDocument> {
      const entry = await OnboardingHistories.findOne({ userId });

      if (!entry) {
        return OnboardingHistories.create({ userId, isCompleted: true });
      }

      return OnboardingHistories.updateOne(
        { userId },
        { $set: { isCompleted: true } }
      );
    }

    public static async completeShowStep(
      step: string,
      userId: string
    ): Promise<void> {
      return OnboardingHistories.updateOne(
        { userId },
        { $push: { completedSteps: step } },
        { upsert: true }
      );
    }

    public static async userStatus(userId: string): Promise<string> {
      const entries = await OnboardingHistories.find({ userId });
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

loadClass();
loadOnboardingHistoryClass();

// tslint:disable-next-line
export const RobotEntries = model<IRobotEntryDocument, IRobotEntryModel>(
  'robot_entries',
  robotEntrySchema
);

// tslint:disable-next-line
export const OnboardingHistories = model<
  IOnboardingHistoryDocument,
  IOnboardingHistoryModel
>('onboarding_histories', onboardingHistorySchema);
