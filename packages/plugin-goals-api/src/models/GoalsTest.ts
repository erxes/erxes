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
      // const data = await models.Goals.getGoal(_id);
      // if (!data) {
      //   throw new Error(`not found with id ${_id}`);
      // }
      // return models.Goals.remove({ _id });
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

      // const doc = await models.Goals.find({}).lean();
      // const data = await progressFunctionIds(doc);
      // return data;
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
      { runValdatiors: true }
    );
    return result;
  }

  async function progressFunctionIds(doc) {
    // tslint:disable-next-line:interface-name
    interface DataItem {
      stageId: any;
      _id: any;
      current: any;
      progress: any;
      amountData: any;
      target: any;
    }

    const data: DataItem[] = [];

    for (const item of doc) {
      const fetchedBoard = await sendCardsMessage({
        subdomain,
        action: 'boards.find',
        data: {
          _id: item.boardId
        },
        isRPC: true
      });
      const fetchedStages = await sendCardsMessage({
        subdomain,
        action: 'stages.find',
        data: {
          _id: item.stageId
        },
        isRPC: true
      });
      const fetchedPipelines = await sendCardsMessage({
        subdomain,
        action: 'pipelines.find',
        data: {
          _id: item.pipelineId
        },
        isRPC: true
      });

      for (const stagesItem of fetchedStages) {
        await models.Goals.updateOne(
          { stageId: stagesItem._id }, // Replace '_id' with the appropriate identifier for your Goals model
          { $set: { stageName: stagesItem.name } },
          { runValidators: true } // This option ensures that the validators are run
        );
      }
      for (const boardItem of fetchedBoard) {
        await models.Goals.updateOne(
          { boardId: boardItem._id }, // Replace '_id' with the appropriate identifier for your Goals model
          { $set: { boardName: boardItem.name } },
          { runValidators: true } // This option ensures that the validators are run
        );
      }
      for (const pipelineItem of fetchedPipelines) {
        await models.Goals.updateOne(
          { pipelineId: pipelineItem._id }, // Replace '_id' with the appropriate identifier for your Goals model
          { $set: { pipelineName: pipelineItem.name } },
          { runValidators: true } // This option ensures that the validators are run
        );
      }

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

    return updates;
  }

  async function differenceFunction(amount: number, target: number) {
    const diff = (amount / target) * 100;
    return diff;
  }

  goalSchema.loadClass(Goal);

  return goalSchema;
};

// async function amountFunction(action_name, goal) {
//   const amount = await sendCardsMessage({
//     subdomain,
//     action: action_name,
//     data: {
//       stageId: goal?.stageId
//     },
//     isRPC: true
//   });

//   let mobileAmountsData;
//   let data;
//   let totalAmount = 0;
//   for (const items of amount) {
//     if (items.productsData && items.status === 'active') {
//       const productsData = items.productsData;
//       productsData.forEach((item) => {
//         totalAmount += item.amount;
//       });
//     }
//     if (items.mobileAmounts && items.mobileAmounts.length > 0) {
//       mobileAmountsData = items.mobileAmounts[0].amount;
//     }
//     if (items.paymentsData) {
//       const paymentsData = items.paymentsData;
//       if (paymentsData.prepay) {
//         data = paymentsData.prepay;
//       } else if (paymentsData.cash) {
//         data = paymentsData.cash;
//       } else if (paymentsData.bankTransaction) {
//         data = paymentsData.bankTransaction;
//       } else if (paymentsData.posTerminal) {
//         data = paymentsData.posTerminal;
//       } else if (paymentsData.wallet) {
//         data = paymentsData.wallet;
//       } else if (paymentsData.barter) {
//         data = paymentsData.barter;
//       } else if (paymentsData.receivable) {
//         data = paymentsData.receivable;
//       } else if (paymentsData.other) {
//         data = paymentsData.other;
//       }
//     }
//   }

//   const result = {
//     mobileAmountsData,
//     data,
//     totalAmount
//   };

//   return result;
// }
// async function countFunction(action_name, goal) {
//   const count = await sendCardsMessage({
//     subdomain,
//     action: action_name,
//     data: {
//       stageId: goal?.stageId
//     },
//     isRPC: true
//   });
//   const activeElements = count.filter((item) => item.status === 'active');

//   // Getting the count of elements with status 'active'
//   const activeCount = activeElements.length;
//   return activeCount;
// }
