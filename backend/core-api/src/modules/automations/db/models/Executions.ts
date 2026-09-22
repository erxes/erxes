import { Model } from 'mongoose';
import {
  automationExecutionSchema,
  IAutomationExecution,
  IAutomationExecutionDocument,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

export interface IAutomationStatsCount {
  key: string;
  count: number;
}

export interface IAutomationStatsBucket {
  date: string;
  total: number;
  complete: number;
  error: number;
  waiting: number;
}

export interface IAutomationStatsNode {
  actionId: string;
  actionType?: string;
  total: number;
  success: number;
  error: number;
  waiting: number;
  avgDurationMs?: number;
  maxDurationMs?: number;
  errorCodes: IAutomationStatsCount[];
}

export interface IAutomationStatsErrorMessage {
  message: string;
  errorCode: string;
  actionTypes: string[];
  count: number;
  lastAt?: Date;
}

export interface IAutomationStats {
  total: number;
  byStatus: IAutomationStatsCount[];
  byErrorCode: IAutomationStatsCount[];
  timeSeries: IAutomationStatsBucket[];
  nodes: IAutomationStatsNode[];
  errorMessages: IAutomationStatsErrorMessage[];
}

type TStatsFacet = {
  byStatus: { _id: string; count: number }[];
  timeSeries: (Omit<IAutomationStatsBucket, 'date'> & { _id: string })[];
  nodes: (Omit<IAutomationStatsNode, 'actionId' | 'errorCodes'> & {
    _id: string;
  })[];
  nodeErrors: {
    _id: { actionId: string; errorCode: string };
    count: number;
  }[];
  errorMessages: {
    _id: { message: unknown; errorCode: string };
    count: number;
    actionTypes: string[];
    lastAt?: Date;
  }[];
};

const countWhen = (field: string, value: string) => ({
  $sum: { $cond: [{ $eq: [field, value] }, 1, 0] },
});

// Distinct messages are unbounded (ids get interpolated into them), so only the
// worst offenders are returned and each one is capped.
const ERROR_MESSAGE_LIMIT = 20;
const ERROR_MESSAGE_MAX_LENGTH = 500;

// Not every thrown value is a string — zod errors arrive as a serialised blob.
const toErrorMessage = (message: unknown) => {
  if (message === null || message === undefined) {
    return 'Unknown error';
  }

  const text =
    typeof message === 'string' ? message : JSON.stringify(message) || '';

  return text.length > ERROR_MESSAGE_MAX_LENGTH
    ? `${text.slice(0, ERROR_MESSAGE_MAX_LENGTH)}…`
    : text;
};

// $group returns buckets in no defined order, so counts are sorted with the
// key as a tiebreak — equal counts must not swap places between requests.
const byCountThenKey = (a: IAutomationStatsCount, b: IAutomationStatsCount) =>
  b.count - a.count || a.key.localeCompare(b.key);

// One list page worth of rows; the list is cursor paginated well below this.
const EXECUTION_COUNT_ID_LIMIT = 100;

export interface IExecutionModel extends Model<IAutomationExecutionDocument> {
  createExecution(doc: IAutomationExecution): IAutomationExecutionDocument;
  getExecution(selector: any): IAutomationExecutionDocument;
  removeExecutions(automationIds: string[]): Promise<void>;
  getStats(filter: any): Promise<IAutomationStats>;
  getExecutionCounts(automationIds: string[]): Promise<IAutomationStatsCount[]>;
}

export const loadClass = (models: IModels) => {
  class Execution {
    public static async createExecution(doc) {
      return models.AutomationExecutions.create({
        createdAt: new Date(),
        ...doc,
      });
    }

    public static async getExecution(selector) {
      return models.AutomationExecutions.findOne(selector);
    }

    public static async removeExecutions(automationIds) {
      return models.AutomationExecutions.deleteMany({
        automationId: { $in: automationIds },
      });
    }

    /**
     * Run counts for a page of the automations list, in one round trip.
     * Root executions only, so a row's count matches what its history tab and
     * stats page show.
     */
    public static async getExecutionCounts(automationIds: string[]) {
      const ids = [...new Set(automationIds)].slice(
        0,
        EXECUTION_COUNT_ID_LIMIT,
      );

      if (!ids.length) {
        return [];
      }

      const counts = await models.AutomationExecutions.aggregate<{
        _id: string;
        count: number;
      }>([
        {
          $match: {
            automationId: { $in: ids },
            parentExecutionId: { $exists: false },
          },
        },
        { $group: { _id: '$automationId', count: { $sum: 1 } } },
      ]);

      return counts.map(({ _id, count }) => ({ key: _id, count }));
    }

    /**
     * Run counts stay on root executions so the numbers match the history
     * list, while node stats also cover actions that ran inside a workflow
     * child execution.
     */
    public static async getStats(filter: any): Promise<IAutomationStats> {
      const rootOnly = { $match: { parentExecutionId: { $exists: false } } };

      const [result] = await models.AutomationExecutions.aggregate<TStatsFacet>(
        [
          { $match: filter },
          {
            $facet: {
              byStatus: [
                rootOnly,
                { $group: { _id: '$status', count: { $sum: 1 } } },
              ],
              timeSeries: [
                rootOnly,
                {
                  $group: {
                    _id: {
                      $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                    },
                    total: { $sum: 1 },
                    complete: countWhen('$status', 'complete'),
                    error: countWhen('$status', 'error'),
                    waiting: countWhen('$status', 'waiting'),
                  },
                },
                { $sort: { _id: 1 } },
              ],
              nodes: [
                { $unwind: '$actions' },
                {
                  $group: {
                    _id: '$actions.actionId',
                    actionType: { $first: '$actions.actionType' },
                    total: { $sum: 1 },
                    success: countWhen('$actions.status', 'success'),
                    error: countWhen('$actions.status', 'error'),
                    waiting: countWhen('$actions.status', 'waiting'),
                    avgDurationMs: { $avg: '$actions.durationMs' },
                    maxDurationMs: { $max: '$actions.durationMs' },
                  },
                },
                { $sort: { total: -1, _id: 1 } },
              ],
              // Failure reasons per node; executions written before error codes
              // existed fall into UNKNOWN.
              nodeErrors: [
                { $unwind: '$actions' },
                { $match: { 'actions.status': 'error' } },
                {
                  $group: {
                    _id: {
                      actionId: '$actions.actionId',
                      errorCode: {
                        $ifNull: ['$actions.errorCode', 'UNKNOWN'],
                      },
                    },
                    count: { $sum: 1 },
                  },
                },
                { $sort: { count: -1, '_id.errorCode': 1 } },
              ],
              // How often the exact same failure repeats — the message is the
              // only place the real cause is written down today.
              errorMessages: [
                { $unwind: '$actions' },
                { $match: { 'actions.status': 'error' } },
                {
                  $group: {
                    _id: {
                      message: '$actions.result.error',
                      errorCode: {
                        $ifNull: ['$actions.errorCode', 'UNKNOWN'],
                      },
                    },
                    count: { $sum: 1 },
                    actionTypes: { $addToSet: '$actions.actionType' },
                    lastAt: { $max: '$actions.finishedAt' },
                  },
                },
                { $sort: { count: -1, '_id.errorCode': 1 } },
                { $limit: ERROR_MESSAGE_LIMIT },
              ],
            },
          },
        ],
      );

      const {
        byStatus = [],
        timeSeries = [],
        nodes = [],
        nodeErrors = [],
        errorMessages = [],
      } = result || {};

      const errorCodesByNode = new Map<string, IAutomationStatsCount[]>();
      const errorCodeTotals = new Map<string, number>();

      for (const { _id, count } of nodeErrors) {
        const { actionId, errorCode } = _id;

        errorCodeTotals.set(
          errorCode,
          (errorCodeTotals.get(errorCode) || 0) + count,
        );
        errorCodesByNode.set(actionId, [
          ...(errorCodesByNode.get(actionId) || []),
          { key: errorCode, count },
        ]);
      }

      return {
        total: byStatus.reduce((sum, { count }) => sum + count, 0),
        byStatus: byStatus
          .map(({ _id, count }) => ({ key: _id, count }))
          .sort(byCountThenKey),
        byErrorCode: [...errorCodeTotals.entries()]
          .map(([key, count]) => ({ key, count }))
          .sort(byCountThenKey),
        timeSeries: timeSeries.map(({ _id, ...bucket }) => ({
          date: _id,
          ...bucket,
        })),
        nodes: nodes.map(({ _id, ...node }) => ({
          actionId: _id,
          ...node,
          errorCodes: errorCodesByNode.get(_id) || [],
        })),
        errorMessages: errorMessages.map(({ _id, ...entry }) => ({
          ...entry,
          message: toErrorMessage(_id.message),
          errorCode: _id.errorCode,
        })),
      };
    }
  }

  automationExecutionSchema.loadClass(Execution);

  return automationExecutionSchema;
};
