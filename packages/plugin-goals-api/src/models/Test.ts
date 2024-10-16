import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { sendCardsMessage, sendSegmentsMessage } from '../messageBroker';
import { testSchema, ITest, ITestDocument } from './definitions/test';
import { CONTRIBUTIONTYPE, TEAMGOALTYPE } from '../constants';
export interface ITestModel extends Model<ITestDocument> {
  getTest(_id: string): Promise<ITestDocument>;
  createTest(doc: ITest): Promise<ITestDocument>;
  updateTest(_id: string, doc: ITest): Promise<ITestDocument>;
  removeTest(_ids: string[]);
}

export const loadTestClass = (models: IModels, subdomain: string) => {
  class Test {
    public static async createTest(doc: ITest, createdUserId: string) {
      return models.Tests.create({
        ...doc,
        createdDate: new Date(),
        createdUserId
      });
    }

    public static async getTest(_id: string) {
      const goal = await models.Tests.findOne({
        _id
      });

      if (!goal) {
        throw new Error('goal not found');
      }
      return goal;
    }

    public static async updateTest(_id: string, doc: ITest) {
      await models.Tests.updateOne(
        {
          _id
        },
        {
          $set: doc
        },
        {
          runValidators: true
        }
      );

      return models.Tests.findOne({
        _id
      });
    }

    public static async removeTest(_ids: string[]) {
      return models.Tests.deleteMany({
        _id: {
          $in: _ids
        }
      });
    }
  }

  testSchema.loadClass(Test);

  return testSchema;
};
