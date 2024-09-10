import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { sendCardsMessage, sendSegmentsMessage } from '../messageBroker';
import { goalSchema, IGoal, IGoalDocument } from './definitions/goals';
import { CONTRIBUTIONTYPE, TEAMGOALTYPE } from '../constants';
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
    interface Product {
      amount: number;
    }

    interface PaymentData {
      prepay?: number;
      cash?: number;
      bankTransaction?: number;
      posTerminal?: number;
      wallet?: number;
      barter?: number;
      receivable?: number;
      other?: number;
    }

    interface FilteredAmount {
      productsData?: Product[];
      mobileAmounts?: { amount: number }[];
      paymentsData?: PaymentData;
      status?: string;
    }

    interface Goal {
      _id: string;
      addMonthly: string;
      addTarget: number;
      current?: number;
      progress?: number;
      filteredAmount: FilteredAmount[];
    }
    const data: DataItem[] = [];
    for (const item of doc) {
      let amount;

      let requestData: any;

      if (item.contributionType === CONTRIBUTIONTYPE.PERSON) {
        requestData = {
          assignedUserIds: item.contribution
        };
      } else if (item.contributionType === CONTRIBUTIONTYPE.TEAM) {
        if (item.teamGoalType === TEAMGOALTYPE.DEPARTMENT) {
          requestData = {
            departmentIds: item.department
          };
        } else if (item.teamGoalType === TEAMGOALTYPE.BRANCH) {
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
        // Your existing goals fetching logic
        const filteredGoals: Goal[] = await getFilteredGoals(item, amount);

        let mobileAmountsData: number | undefined;
        let data: number | undefined;
        let totalAmount = 0;

        // Type for updated goals without filteredAmount
        type GoalWithoutFilteredAmount = Omit<Goal, 'filteredAmount'>;

        const updatedGoals: GoalWithoutFilteredAmount[] = [];

        // Process filtered goals
        for (const goal of filteredGoals) {
          let goalTotalAmount = 0; // Total amount for each goal

          // Calculate totalAmount for each goal
          for (const items of goal.filteredAmount) {
            if (items.productsData && items.status === 'active') {
              items.productsData.forEach((product) => {
                if (product.amount) {
                  goalTotalAmount += product.amount;
                }
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

          // Calculate progress as a percentage
          const progress = ((goal.addTarget / goalTotalAmount) * 100).toFixed(
            2
          );

          // Prepare updated goal object
          updatedGoals.push({
            _id: goal._id,
            addMonthly: goal.addMonthly,
            addTarget: goal.addTarget,
            current: goalTotalAmount,
            progress: parseFloat(progress)
          });

          // Accumulate total amount
          totalAmount += goalTotalAmount;
        }

        // Merging function that now accepts GoalWithoutFilteredAmount[]
        function mergeGoalsWithDefaults(
          existingGoals: GoalWithoutFilteredAmount[],
          allGoals: Goal[]
        ): Goal[] {
          const updatedGoalsMap = new Map(
            existingGoals.map((goal) => [goal._id, goal])
          );

          return allGoals.map((goal) => {
            const existingGoal = updatedGoalsMap.get(goal._id);

            return {
              ...goal,
              current: existingGoal ? existingGoal.current : 0,
              progress: existingGoal ? existingGoal.progress : 0
              // Add filteredAmount back if required
            };
          });
        }

        // Get the result with merged goals and defaults
        const result = mergeGoalsWithDefaults(
          updatedGoals,
          item.specificPeriodGoals
        );
        const amountData = {
          mobileAmountsData,
          paymentsData: data
        };
        // console.log(amountData, 'amountData');
        // console.log(updatedGoals, 'updatedGoals');
        try {
          await models.Goals.updateOne(
            { _id: item._id },
            {
              $set: {
                specificPeriodGoals: result
              }
            }
          );
          console.log('Goals updated successfully');
        } catch (error) {
          console.error('Error updating goals:', error);
        }
      } else if (item.metric === 'Count') {
        function calculateProgressAndCurrent(filteredGoals: Goal[]): Goal[] {
          return filteredGoals.map((goal) => {
            let current = 0;

            // Calculate total amount or count for each goal
            if (goal.filteredAmount) {
              current = goal.filteredAmount.length; // Or your specific calculation logic
            }

            // Calculate progress as a percentage of the target
            const progress = (current / goal.addTarget) * 100;

            return {
              ...goal,
              current,
              progress: parseFloat(progress.toFixed(2)) // Round to 2 decimal places
            };
          });
        }
        console.log(item, '********');
        // Step 2: Filter goals and calculate their current and progress
        const countGoal: Goal[] = await getFilteredGoals(item, amount);

        const countUpdateGoal = calculateProgressAndCurrent(countGoal);
        function mergeGoals(
          countUpdateGoal: Goal[],
          specificPeriodGoals: Goal[]
        ): Goal[] {
          const updatedGoalsMap = new Map(
            countUpdateGoal.map((goal) => [goal._id, goal])
          );

          return specificPeriodGoals.map((goal) => {
            const updatedGoal = updatedGoalsMap.get(goal._id);

            return {
              ...goal,
              current: updatedGoal ? updatedGoal.current : 0,
              progress: updatedGoal ? updatedGoal.progress : 0
            };
          });
        }
        const result = mergeGoals(countUpdateGoal, item.specificPeriodGoals);
        try {
          await models.Goals.updateOne(
            { _id: item._id },
            {
              $set: {
                specificPeriodGoals: result
              }
            }
          );
          console.log('Goals updated successfully');
        } catch (error) {
          console.error('Error updating goals:', error);
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

  goalSchema.loadClass(Goal);

  return goalSchema;
};

function parseMonth(monthStr) {
  const match = monthStr.match(/Month of (\w+) (\d{4})/);
  if (match) {
    const [_, month, year] = match;
    const monthMap = {
      January: 0,
      February: 1,
      March: 2,
      April: 3,
      May: 4,
      June: 5,
      July: 6,
      August: 7,
      September: 8,
      October: 9,
      November: 10,
      December: 11
    };
    const monthIndex = monthMap[month];
    return {
      start: new Date(Date.UTC(year, monthIndex, 1)),
      end: new Date(Date.UTC(year, monthIndex + 1, 0))
    };
  }
  return { start: null, end: null };
}

// Function to filter amounts based on the goal's start and end dates
function filterAmountsForGoal(goal, amounts) {
  const { start: goalStartDate, end: goalEndDate } = parseMonth(
    goal.addMonthly
  );

  if (!goalStartDate || !goalEndDate) {
    console.error(`Failed to parse month for goal: ${goal.addMonthly}`);
    return [];
  }

  return amounts.filter((entry) => {
    const createdAt = new Date(entry.createdAt);
    return createdAt >= goalStartDate && createdAt <= goalEndDate;
  });
}

// Function to process specific period goals and filter associated amounts
function getFilteredGoals(item, amounts) {
  return item.specificPeriodGoals
    .map((goal) => ({
      ...goal,
      filteredAmount: filterAmountsForGoal(goal, amounts)
    }))
    .filter((goal) => goal.filteredAmount.length > 0); // Keep goals with at least one filtered amount
}
