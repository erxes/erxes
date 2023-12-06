import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { sendCardsMessage, sendSegmentsMessage } from '../messageBroker';
import { goalSchema, IGoal, IGoalDocument } from './definitions/goals';
export interface IGoalModel extends Model<IGoalDocument> {
  getGoal(_id: string): Promise<IGoalDocument>;
  createGoal(doc: IGoal): Promise<IGoalDocument>;
  updateGoal(_id: string, doc: IGoal): Promise<IGoalDocument>;
  removeGoal(_ids: string[]);
  progressGoal(_id: string);
  progressIdsGoals(filter, params): Promise<IGoalDocument>;
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
      return goal;
    }

    public static async progressIdsGoals(filter, params) {
      try {
        // const doc = await models.Goals.find({}).lean();
        const doc = await models.Goals.find(filter)
          .skip((params.page - 1) * params.perPage)
          .limit(params.perPage);

        const data = await progressFunctionIds(doc);
        return data === true ? true : false;
      } catch (error) {
        // Handle the error appropriately
        console.error('Error fetching progress IDs goals:', error);
        return []; // Return an empty array or handle the error accordingly
      }
    }
  }

  async function progressFunctionIds(doc) {
    // tslint:disable-next-line:interface-name
    interface DataItem {
      stageId: string;
      _id: string;
      current: string;
      progress: string;
      amountData: any;
      target: number;
    }

    const data: DataItem[] = [];

    for (const item of doc) {
      let amount;

      // Check if any of the conditions are met to send the request
      let requestData: any;

      if (item.contributionType === 'person') {
        requestData = {
          assignedUserIds: item.contribution
        };
      } else if (item.contributionType === 'team') {
        if (item.teamGoalType === 'Departments') {
          requestData = {
            departmentIds: item.department
          };
        } else if (item.teamGoalType === 'Branches') {
          requestData = {
            branchIds: item.branch
          };
        }
      }
      // Send the request
      amount = await sendCardsMessage({
        subdomain,
        action: item.entity + 's.find',
        data: {
          ...requestData, // Spread the requestData to include its properties
          stageId: item.stageId
        },
        isRPC: true
      });

      let customerIdsBySegments: string[] = [];

      try {
        // Assuming 'item' is the object containing segmentIds
        for (const segment of item.segmentIds || []) {
          const cIds = await sendSegmentsMessage({
            isRPC: true,
            subdomain,
            action: 'fetchSegment',
            data: { segmentId: segment }
          });

          // Concatenate the fetched customer IDs to the array
          customerIdsBySegments = [...customerIdsBySegments, ...cIds];
        }

        // Get the count of elements in the array
        const count = customerIdsBySegments.length;

        // Update the database
        await models.Goals.updateOne(
          { _id: item._id },
          {
            $set: {
              segmentCount: count
            }
          }
        );
      } catch (error) {
        throw new Error(error);
      }
      let current;
      let progress;
      let amountData;

      if (item.metric === 'Value') {
        let mobileAmountsData;
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
        progress = await differenceFunction(current, item.target);
        if (
          item.specificPeriodGoals &&
          Array.isArray(item.specificPeriodGoals)
        ) {
          const updatedSpecificPeriodGoals = item.specificPeriodGoals.map(
            result => {
              let convertedNumber;
              if (totalAmount === 0 || result.addTarget === 0) {
                convertedNumber = 100;
              } else {
                const diff = (totalAmount / result.addTarget) * 100;
                convertedNumber = diff.toFixed(3);
              }

              return {
                ...result,
                addMonthly: result.addMonthly, // Update other properties as needed
                progress: convertedNumber // Update the progress property
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
      } else if (item.metric === 'Count') {
        const activeElements = amount.filter(item => item.status === 'active');
        current = activeElements.length;

        progress = await differenceFunction(current, item.target);
        if (
          item.specificPeriodGoals &&
          Array.isArray(item.specificPeriodGoals)
        ) {
          const updatedSpecificPeriodGoals = item.specificPeriodGoals.map(
            result => {
              let convertedNumber;
              if (current === 0 || result.addTarget === 0) {
                convertedNumber = 100;
              } else {
                const diff = (current / result.addTarget) * 100;
                convertedNumber = diff.toFixed(3);
              }

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

      data.push({
        stageId: item.stageId,
        _id: item._id,
        current,
        progress,
        amountData,
        target: item.target
      });
    }

    try {
      for (const result of data) {
        try {
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
        } catch (error) {
          // Handle the error here
          throw new Error(error);
        }
      }
      return true;
    } catch (error) {
      throw new Error(error);
    }
  }

  async function differenceFunction(amount: number, target: number) {
    let convertedNumber;
    if (amount === 0 || target === 0) {
      convertedNumber = 100;
    } else {
      const diff = (amount / target) * 100;
      convertedNumber = diff.toFixed(3);
    }

    return convertedNumber;
  }

  goalSchema.loadClass(Goal);

  return goalSchema;
};
