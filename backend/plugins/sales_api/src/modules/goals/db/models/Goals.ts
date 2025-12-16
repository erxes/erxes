import { Model } from "mongoose";
import { IModels } from '~/connectionResolvers';
import { sendTRPCMessage } from "erxes-api-shared/utils";
import { goalSchema } from '~/modules/goals/db/definitions/goals'
import { IGoal, IGoalDocument } from "~/modules/goals/@types/goals";
import { CONTRIBUTIONTYPE, TEAMGOALTYPE } from "../../constants";


export interface IGoalModel extends Model<IGoalDocument> {
  getGoal(_id: string): Promise<IGoalDocument>;
  createGoal(doc: IGoal): Promise<IGoalDocument>; 
  updateGoal(_id: string, doc: IGoal): Promise<IGoalDocument>;
  removeGoal(_ids: string[]);
  progressGoal(_id: string);
  progressIdsGoals(filter, params): Promise<IGoalDocument>;
}

export const loadGoalClass = (models: IModels, subdomain: string, userId?: string) => {
  class Goal {
    public static async createGoal(doc: IGoal, subdomain: string) {
      try {
        console.log('===== START createGoal model method =====');
        console.log('Received doc:', JSON.stringify(doc, null, 2));
        console.log('Received subdomain:', subdomain);

        const goalData = {
          ...doc,
          subdomain: subdomain,
          createdAt: new Date(),
        };

        console.log('Goal data to create:', JSON.stringify(goalData, null, 2));

        // Access the model through the models parameter from closure
        const goal = await models.Goals.create(goalData);
        console.log('Goal created successfully:', goal);

        console.log('===== END createGoal model method =====');
        return goal;
      } catch (e) {
        console.error('GOALS CREATE ERROR:', e);
        console.error('Error stack:', e.stack);
        throw e;
      }
    }

    public static async getGoal(_id: string) {
      const goal = await models.Goals.findOne({ _id });
      if (!goal) {
        throw new Error('Goal not found');
      }
      return goal;
    }

    public static async updateGoal(_id: string, doc: IGoal) {
      await models.Goals.updateOne(
        { _id },
        { $set: doc },
        { runValidators: true },
      );
      return models.Goals.findOne({ _id });
    }

    public static async removeGoal(_ids: string[]) {
      return models.Goals.deleteMany({ _id: { $in: _ids } });
    }

    public static async progressGoal(_id: string) {
      return models.Goals.findOne({ _id });
    }

    public static async progressIdsGoals(filter: any, params: any) {
      try {
        const goals = await fetchGoals(filter, params);

        if (!goals.length) {
          return [];
        }

        const progressIds = await Promise.all(
          goals.map((goal) => progressFunctionIds(goal, models, subdomain)),
        );

        return progressIds.flat();
      } catch (error) {
        console.error('Error fetching progress IDs goals:', error);
        return [];
      }
    }
  }

  async function fetchGoals(filter: any, params: any) {
  return models.Goals.find(filter)
    .skip((params.page - 1) * params.perPage)
    .limit(params.perPage);
  }

  async function progressFunctionIds(doc, models, subdomain) {
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

    interface RequestData {
      tagIds?: string[];
      stageId?: string;
      assignedUserIds?: string[];
      departmentIds?: string[];
      branchIds?: string[];
      companyIds?: string[];
      unit?: string[];
    }

    function getRequestData(item): RequestData {
      const requestData: RequestData = {};

      addTags(item, requestData);
      addStage(item, requestData);
      addPersonContribution(item, requestData);
      addTeamContribution(item, requestData);

      return requestData;
    }

    function addTags(item, requestData: RequestData) {
      if (item.tagsIds?.length) {
        requestData.tagIds = item.tagsIds;
      }
    }

function addStage(item, requestData: RequestData) {
  if (item.stageId) {
    requestData.stageId = item.stageId;
  }
}

function addPersonContribution(item, requestData: RequestData) {
  if (item.contributionType !== CONTRIBUTIONTYPE.PERSON) return;

  const assignedUserIds = item.contribution?.filter(Boolean);
  if (assignedUserIds?.length) {
    requestData.assignedUserIds = assignedUserIds;
  }
}

function addTeamContribution(item, requestData: RequestData) {
  if (item.contributionType !== CONTRIBUTIONTYPE.TEAM) return;

  const mapping = {
    [TEAMGOALTYPE.DEPARTMENT]: { departmentIds: item.department },
    [TEAMGOALTYPE.BRANCH]: { branchIds: item.branch },
    [TEAMGOALTYPE.UNITS]: { unit: item.unit }
  };

  Object.assign(requestData, mapping[item.teamGoalType] || {});
}


    
    doc = Array.isArray(doc) ? doc : [doc];
    for (const item of doc) {
      let amount;
      const type = item.periodGoal;
      
      let requestData = getRequestData(item);

      const entityMessageMap = {
        deal: sendTRPCMessage,
        task: sendTRPCMessage,
        purchase: sendTRPCMessage,
        ticket: sendTRPCMessage
      };

      let cardType = entityMessageMap[item.entity];
      if (!cardType) {
        throw new Error(`Unsupported entity: ${item.entity}`);
      }
      try {
        amount = await getAmount(item, subdomain, requestData);
      } catch (error) {
        console.error(`Error fetching amount for ${item.entity}:`, error);
        continue;
      }
      let companies;
      if (item.contributionType === CONTRIBUTIONTYPE.TEAM) {


        if (item.companyIds && Array.isArray(item.companyIds)) {
          const mainTypeIds = Array.isArray(amount)
            ? amount.map((result) => result._id)
            : [amount._id];

          try {
            companies = await getCompanies(item, subdomain, mainTypeIds);
          } catch (error) {
            console.error(
              `Error fetching companies for ${item.entity}:`,
              error
            );
            continue;
          }
        } else {
          throw new Error(
            '"No companyIds found or companyIds is not an array"'
          );
        }
      }

      if (companies.length > 0) {
        amount = amount.filter((result) =>
          companies.some((conformity) => conformity.mainTypeId === result._id)
        );
      }
      if (!Array.isArray(amount) || amount.length === 0) {
        console.log("No valid amount found, skipping this item.");
        continue;
      }

      let customerIdsBySegments: string[] = [];

      try {
        for (const segment of item.segmentIds || []) {
          const cIds = await sendTRPCMessage({
            subdomain,
            pluginName: 'core',
            method: 'query',
            module: 'segments',
            action: 'fetchSegment',
            input: { segmentId: segment },
            defaultValue: [],
          });


          customerIdsBySegments = [...customerIdsBySegments, ...cIds];
        }

        const count = customerIdsBySegments.length;

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
      const filteredGoals: Goal[] = await getFilteredGoals(item, amount, type);
      if (item.metric === "Value") {
        let mobileAmountsData: number | undefined;
        let data: number | undefined;
        let totalAmount = 0;

        type GoalWithoutFilteredAmount = Omit<Goal, "filteredAmount">;

        const updatedGoals: GoalWithoutFilteredAmount[] = [];
        // Process filtered goals
        for (const goal of filteredGoals) {
          let goalTotalAmount = 0;

          for (const items of goal.filteredAmount) {
            if (items.productsData && items.status === "active") {
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

          const progress = ((goalTotalAmount / goal.addTarget) * 100).toFixed(
            2
          );

          updatedGoals.push({
            _id: goal._id,
            addMonthly: goal.addMonthly,
            addTarget: goal.addTarget || 0,
            current: goalTotalAmount,
            progress: parseFloat(progress)
          });

          totalAmount += goalTotalAmount;
        }

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
            };
          });
        }

        const result = mergeGoalsWithDefaults(
          updatedGoals,
          item.specificPeriodGoals
        );
        const amountData = {
          mobileAmountsData,
          paymentsData: data
        };
        try {
          await models.Goals.updateOne(
            { _id: item._id },
            {
              $set: {
                specificPeriodGoals: result
              }
            }
          );
        } catch (error) {
          console.error('Error updating goals:', error);
        }
      } else if (item.metric === 'Count') {
        function calculateProgressAndCurrent(filteredGoals: Goal[]): Goal[] {
          return filteredGoals.map((goal) => {
            let current = 0;

            if (goal.filteredAmount) {
              if (Array.isArray(goal.filteredAmount)) {
                current = goal.filteredAmount.length;
              } else if (typeof goal.filteredAmount === "number") {
                current = goal.filteredAmount;
              }
            }

            const progress =
              goal.addTarget > 0 ? (current / goal.addTarget) * 100 : 0;

            return {
              ...goal,
              current,
              progress: parseFloat(progress.toFixed(2)) // Round to 2 decimal places
            };
          });
        }

        const countGoal: Goal[] = await getFilteredGoals(item, amount, type);
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
            { $set: { specificPeriodGoals: result } }
          );
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
    if (monthIndex === undefined) {
      console.error(`Invalid month name: ${month}`);
      return { start: null, end: null };
    }
    return {
      start: new Date(Date.UTC(year, monthIndex, 1)),
      end: new Date(Date.UTC(year, monthIndex + 1, 0))
    };
  } else {
    console.error(`Failed to parse month for goal: ${monthStr}`);
    return { start: null, end: null };
  }
}

function parseWeek(weekString: string): { start: Date; end: Date } {
  const regex =
    /Week of (\w{3}) (\w{3} \d{2} \d{4}) - (\w{3}) (\w{3} \d{2} \d{4})/;
  const matches = weekString.match(regex);

  if (!matches) {
    throw new Error(`Invalid week string format. Received: "${weekString}"`);
  }

  const startDate = new Date(matches[2]);
  const endDate = new Date(matches[4]);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error(`Invalid date format in week string: "${weekString}"`);
  }

  return {
    start: startDate,
    end: endDate
  };
}

function filterAmountsForGoal(goal, amounts, type) {
  let goalStartDate, goalEndDate;
  if (type === "Monthly") {
    const { start, end } = parseMonth(goal.addMonthly);
    goalStartDate = start;
    goalEndDate = end;
  } else if (type === "Weekly") {
    const { start, end } = parseWeek(goal.addMonthly);
    goalStartDate = start;
    goalEndDate = end;
  } else {
    console.error(`Invalid goal period: ${goal.periodGoal}`);
    return [];
  }

  if (!goalStartDate || !goalEndDate) {
    console.error(`Failed to parse dates for goal: ${goal.addMonthly}`);
    return [];
  }

  goalStartDate = new Date(goalStartDate).getTime();
  goalEndDate = new Date(goalEndDate).getTime();

  return amounts.filter((entry) => {
    const createdAt = new Date(entry.createdAt).getTime();
    return createdAt >= goalStartDate && createdAt <= goalEndDate;
  });
}

function getFilteredGoals(item, amounts, type) {
  return item.specificPeriodGoals
    .map((goal) => ({
      ...goal,
      filteredAmount: filterAmountsForGoal(goal, amounts, type)
    }))
    .filter((goal) => goal.filteredAmount.length > 0);
}

async function getAmount(item, subdomain, requestData) {
  const entityMessageMap = {
    deal: {
    pluginName: 'sales',
    module: 'deal',
  },
  task: {
    pluginName: 'tasks',
    module: 'tasks',
  },
  purchase: {
    pluginName: 'purchases',
    module: 'purchases',
  },
  ticket: {
    pluginName: 'tickets',
    module: 'tickets',
  },
  };

  const cardType = entityMessageMap[item.entity];
  if (!cardType) {
    throw new Error(`Unsupported entity: ${item.entity}`);
  }

  if (!cardType.module) {
    throw new Error(`No module configured for entity ${item.entity}`);
  }

  return await sendTRPCMessage({
  subdomain,
  pluginName: cardType.pluginName, 
  module: cardType.module,         
  action: 'find',
  input: requestData,
  defaultValue: [],
  });

}


async function getCompanies(item, subdomain, mainTypeIds) {
  const conformities = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'conformities',
    action: 'getConformities',
    input: {
      mainType: item.entity,
      mainTypeIds,
      companyIds: item.companyIds,
      relTypes: ['company'],
    },
    defaultValue: [],
  });


  // Filter companies where relTypeId matches any of the provided companyIds
  return conformities.filter((result) =>
    item.companyIds.includes(result.relTypeId)
  );
}
