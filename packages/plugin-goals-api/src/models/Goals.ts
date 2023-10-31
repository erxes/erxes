import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { IGoal, IGoalDocument, goalSchema } from './definitions/goals';
import {
  sendCardsMessage,
  sendStageMessage,
  sendBoardMessage
} from '../messageBroker';
import { Goals } from '../graphql/resolvers/mutations';
import _ = require('underscore');
import { resolve } from 'path';
export interface IGoalModel extends Model<IGoalDocument> {
  getGoal(_id: string): Promise<IGoalDocument>;
  createGoal(doc: IGoal): Promise<IGoalDocument>;
  updateGoal(_id: string, doc: IGoal): Promise<IGoalDocument>;
  removeGoal(_ids: string[]);
  progressGoal(_id: string);
  progressIdsGoals(): Promise<IGoalDocument>;
}

export const loadGoalClass = (models: IModels, subdomain: string) => {
  class Goal {
    public static async createGoal(doc: IGoal, createdUserId: string) {
      return models.Goals.create({
        ...doc,
        createdDate: new Date(),
        createdUserId
      });
    }

    public static async getGoal(_id: string) {
      const goal = await models.Goals.findOne({
        _id
      });

      if (!goal) {
        throw new Error('goal not found');
      }
      return goal;
    }

    public static async updateGoal(_id: string, doc: IGoal) {
      await models.Goals.updateOne(
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

      return models.Goals.findOne({
        _id
      });
    }

    public static async removeGoal(_ids: string[]) {
      return models.Goals.deleteMany({
        _id: {
          $in: _ids
        }
      });
    }

    public static async progressGoal(_id: string) {
      const goal = await models.Goals.findOne({
        _id
      });
      const target = goal?.target;

      const action_name = goal?.entity + 's.find';
      const progressed = await progressFunction(
        action_name,
        goal,
        goal?.metric,
        target
      );

      // goal.progress.push(progressed);

      // const data = { ...goal, progressed };
      // const data = { goal, progressed };
      return goal;
    }

    public static async progressIdsGoals() {
      try {
        const doc = await models.Goals.find({}).lean();
        const data = await progressFunctionIds(doc);
        return data;
      } catch (error) {
        // Handle the error appropriately
        console.error('Error fetching progress IDs goals:', error);
        return []; // Return an empty array or handle the error accordingly
      }
    }
  }

  async function progressFunction(action_name, goal, metric, target) {
    const amount = await sendCardsMessage({
      subdomain,
      action: action_name,
      data: {
        stageId: goal?.stageId
      },
      isRPC: true
    });
    let current;
    let progress;
    let amountData;
    if (metric === 'Value') {
      let mobileAmountsData;
      // tslint:disable-next-line:no-shadowed-variable
      let data;
      let totalAmount = 0;
      for (const items of amount) {
        if (items.productsData && items.status === 'active') {
          const productsData = items.productsData;
          productsData.forEach(item => {
            totalAmount += item.amount;
          });
        }
        if (items.mobileAmounts && items.mobileAmounts.length > 0) {
          mobileAmountsData = items.mobileAmounts[0].amount;
        }
        if (items.paymentsData) {
          const paymentsData = items.paymentsData;
          if (paymentsData.prepay) {
            data = paymentsData.prepay;
          } else if (paymentsData.cash) {
            data = paymentsData.cash;
          } else if (paymentsData.bankTransaction) {
            data = paymentsData.bankTransaction;
          } else if (paymentsData.posTerminal) {
            data = paymentsData.posTerminal;
          } else if (paymentsData.wallet) {
            data = paymentsData.wallet;
          } else if (paymentsData.barter) {
            data = paymentsData.barter;
          } else if (paymentsData.receivable) {
            data = paymentsData.receivable;
          } else if (paymentsData.other) {
            data = paymentsData.other;
          }
        }
      }
      current = totalAmount;
      amountData = {
        mobileAmountsData,
        paymentsData: data
      };
      progress = await differenceFunction(
        current,
        // tslint:disable-next-line:radix
        parseInt(target || '')
      );
    } else if (metric === 'Count') {
      const activeElements = amount.filter(item => item.status === 'active');
      // Getting the count of elements with status 'active'
      current = activeElements.length;

      progress = await differenceFunction(
        current,
        // tslint:disable-next-line:radix
        parseInt(target || '')
      );
    }

    const result = await models.Goals.updateOne(
      { _id: goal._id },
      { $set: { progress: { current, progress, amountData, target } } },
      { runValuators: true }
    );
    return result;
  }

  async function progressFunctionIds(doc) {
    // tslint:disable-next-line:interface-name
    interface DataItem {
      stageId: string;
      _id: string;
      current: string;
      progress: string;
      amountData: any;
      target: string;
    }
    // tslint:disable-next-line:interface-name

    const data: DataItem[] = [];

    for (const item of doc) {
      const amount = await sendCardsMessage({
        subdomain,
        action: item.entity + 's.find',
        data: {
          stageId: item.stageId
        },
        isRPC: true
      });
      let current;
      let progress;
      let amountData;

      if (item.metric === 'Value') {
        let mobileAmountsData;
        // tslint:disable-next-line:no-shadowed-variable
        let data;
        let totalAmount = 0;
        for (const items of amount) {
          if (items.productsData && items.status === 'active') {
            const productsData = items.productsData;
            // tslint:disable-next-line:no-shadowed-variable
            productsData.forEach(item => {
              totalAmount += item.amount;
            });
          }
          if (items.mobileAmounts && items.mobileAmounts.length > 0) {
            mobileAmountsData = items.mobileAmounts[0].amount;
          }
          if (items.paymentsData) {
            const paymentsData = items.paymentsData;
            if (paymentsData.prepay) {
              data = paymentsData.prepay;
            } else if (paymentsData.cash) {
              data = paymentsData.cash;
            } else if (paymentsData.bankTransaction) {
              data = paymentsData.bankTransaction;
            } else if (paymentsData.posTerminal) {
              data = paymentsData.posTerminal;
            } else if (paymentsData.wallet) {
              data = paymentsData.wallet;
            } else if (paymentsData.barter) {
              data = paymentsData.barter;
            } else if (paymentsData.receivable) {
              data = paymentsData.receivable;
            } else if (paymentsData.other) {
              data = paymentsData.other;
            }
          }
        }
        current = totalAmount;
        amountData = {
          mobileAmountsData,
          paymentsData: data
        };
        progress = await differenceFunction(
          current,
          // tslint:disable-next-line:radix
          parseInt(item.target || '')
        );
      } else if (item.metric === 'Count') {
        const activeElements = amount.filter(
          // tslint:disable-next-line:no-shadowed-variable
          item => item.status === 'active'
        );
        current = activeElements.length;

        progress = await differenceFunction(
          current,
          // tslint:disable-next-line:radix
          parseInt(item.target || '')
        );
      }

      data.push({
        stageId: item.stageId,
        _id: item._id,
        current,
        progress,
        amountData,
        target: item.target
      });
    }

    for (const result of data) {
      await models.Goals.updateOne(
        { _id: result._id },
        {
          $set: {
            progress: {
              current: result.current,
              progress: result.progress,
              amountData: result.amountData,
              target: result.target,
              _id: result._id
            }
          }
        },
        { runValidators: true }
      );
    }

    const updates = await models.Goals.find({}).lean();
    for (const item of updates) {
      const action_name = item?.entity + 's.find';
      const stage = item?.stageId;
      const amount = await sendCardsMessage({
        subdomain,
        action: action_name,
        data: {
          stageId: stage
        },
        isRPC: true
      });
      let totalAmount = 0;
      let current;
      if (item.metric === 'Value') {
        // let progress;
        for (const items of amount) {
          if (items.productsData && items.status === 'active') {
            const productsData = items.productsData;
            // tslint:disable-next-line:no-shadowed-variable
            productsData.forEach(item => {
              totalAmount += item.amount;
            });
          }
          current = totalAmount;

          if (
            item.specificPeriodGoals &&
            Array.isArray(item.specificPeriodGoals)
          ) {
            const updatedSpecificPeriodGoals = item.specificPeriodGoals.map(
              result => {
                const progress = (current / result.addTarget) * 100;
                const convertedNumber = progress.toFixed(3);

                return {
                  ...result,
                  addMonthly: result.addMonthly, // update other properties as needed
                  progress: convertedNumber // updating the progress property
                };
              }
            );
            await models.Goals.updateOne(
              { _id: item._id },
              {
                $set: {
                  specificPeriodGoals: updatedSpecificPeriodGoals
                }
              }
            );
          }
        }
      } else if (item.metric === 'Count') {
        const activeElements = amount.filter(
          // tslint:disable-next-line:no-shadowed-variable
          item => item.status === 'active'
        );
        current = activeElements.length;
        if (
          item.specificPeriodGoals &&
          Array.isArray(item.specificPeriodGoals)
        ) {
          const updatedSpecificPeriodGoals = item.specificPeriodGoals.map(
            result => {
              const progress = (current / result.addTarget) * 100;
              const convertedNumber = progress.toFixed(3);

              return {
                ...result,
                addMonthly: result.addMonthly, // update other properties as needed
                current,
                progress: convertedNumber // updating the progress property
              };
            }
          );
          await models.Goals.updateOne(
            { _id: item._id },
            {
              $set: {
                specificPeriodGoals: updatedSpecificPeriodGoals
              }
            }
          );
        }
      }
    }
    return updates;
  }

  async function differenceFunction(amount: number, target: number) {
    const diff = (amount / target) * 100;
    const convertedNumber = diff.toFixed(3);

    return convertedNumber;
  }

  goalSchema.loadClass(Goal);

  return goalSchema;
};
