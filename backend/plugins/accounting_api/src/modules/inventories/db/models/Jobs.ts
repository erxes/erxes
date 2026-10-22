import { Model } from 'mongoose';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { IJob, IJobDocument, IJobItem, IJobCost } from '../../@types/jobs';
import { jobSchema } from '../definitions/jobs';

const normalizeItems = (items: IJobItem[] = [], requireCostRatio = false) =>
  items
    .filter((item) => item.productId)
    .map((item) => ({
      productId: item.productId,
      uom: item.uom || '',
      quantity: Number(item.quantity || 0),
      costRatio:
        item.costRatio === undefined || item.costRatio === null
          ? undefined
          : Number(item.costRatio),
    }))
    .filter((item) => item.quantity > 0)
    .map((item) => ({
      ...item,
      costRatio: requireCostRatio ? item.costRatio ?? 0 : item.costRatio,
    }));

const validateJob = (params: IJob) => {
  const durationType = params.durationType || 'minut';
  if (!['real', 'minut', 'hour', 'day'].includes(durationType)) {
    throw new Error('Duration type must be real, minut, hour, or day');
  }
  if (
    durationType !== 'real' &&
    (params.duration === undefined ||
      params.duration === null ||
      !Number.isFinite(params.duration) ||
      params.duration < 0)
  ) {
    throw new Error(
      'A non-negative duration is required for minut, hour, or day',
    );
  }
  const inputs = normalizeItems(params.inputs);
  const outputs = normalizeItems(params.outputs, true);

  if (!params.name?.trim()) {
    throw new Error('Job name is required');
  }

  if (!inputs.length) {
    throw new Error('Job input items are required');
  }

  if (!outputs.length) {
    throw new Error('Job output items are required');
  }

  if (
    outputs.some(
      (item) => !Number.isFinite(item.costRatio) || (item.costRatio ?? 0) < 0,
    )
  ) {
    throw new Error(
      'Output cost allocation ratios must be finite non-negative numbers',
    );
  }

  const totalOutputCostRatio = outputs.reduce(
    (sum, item) => sum + (item.costRatio ?? 0),
    0,
  );

  if (!Number.isFinite(totalOutputCostRatio) || totalOutputCostRatio <= 0) {
    throw new Error(
      'Output cost allocation ratios must have a positive finite total',
    );
  }

  return {
    inputs,
    outputs,
    durationType,
    duration: durationType === 'real' ? undefined : params.duration,
  };
};

export interface IJobModel extends Model<IJobDocument> {
  getJob(_id: string): Promise<IJobDocument>;
  createJob(params: IJob, userId: string): Promise<IJobDocument>;
  updateJob(
    params: IJob & { _id: string },
    userId: string,
  ): Promise<IJobDocument>;
  removeJob(_id: string): Promise<{ deletedCount?: number }>;
}

const plainJob = (job: IJobDocument) =>
  typeof job.toObject === 'function' ? job.toObject() : job;

export const loadJobClass = (
  models: IModels,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
  const validateEstimatedCosts = async (params: IJob) => {
    const costs: {
      laborCosts: IJobCost[];
      overheadCosts: IJobCost[];
    } = {
      laborCosts: [],
      overheadCosts: [],
    };
    const accountIds = new Set<string>();
    for (const group of ['laborCosts', 'overheadCosts'] as const) {
      for (const [index, row] of (params[group] ?? []).entries()) {
        const label = `${group} row ${index + 1}`;
        if (!row.name?.trim()) throw new Error(`${label} name is required`);
        if (!Number.isFinite(row.amount) || row.amount < 0) {
          throw new Error(`${label} must be a finite non-negative amount`);
        }
        const accountId = row.accountId?.trim();
        if (!accountId) throw new Error(`${label} posting account is required`);
        costs[group].push({
          name: row.name.trim(),
          amount: row.amount,
          accountId,
        });
        accountIds.add(accountId);
      }
    }
    await Promise.all(
      Array.from(accountIds, (_id) =>
        models.Accounts.getAccount({ _id, status: 'active' }),
      ),
    );
    return costs;
  };

  class Job {
    public static async getJob(_id: string) {
      const job = await models.Jobs.findOne({ _id }).lean();

      if (!job) {
        throw new Error('Job not found');
      }

      return job;
    }

    public static async createJob(params: IJob, userId: string) {
      const { inputs, outputs, duration, durationType } = validateJob(params);
      const estimatedCosts = await validateEstimatedCosts(params);

      const job = await models.Jobs.create({
        code: params.code,
        name: params.name,
        description: params.description,
        duration,
        durationType,
        ...estimatedCosts,
        inputs,
        outputs,
        status: params.status || 'active',
        createdAt: new Date(),
        createdBy: userId,
        modifiedAt: new Date(),
        modifiedBy: userId,
      });
      sendDbEventLog({
        action: 'create',
        docId: job._id,
        currentDocument: plainJob(job),
      });
      return job;
    }

    public static async updateJob(
      params: IJob & { _id: string },
      userId: string,
    ) {
      const { _id } = params;
      const existing = await models.Jobs.getJob(_id);
      const { inputs, outputs, duration, durationType } = validateJob(params);
      const estimatedCosts = await validateEstimatedCosts({
        ...existing,
        ...params,
      });

      await models.Jobs.updateOne(
        { _id },
        {
          $set: {
            code: params.code,
            name: params.name,
            description: params.description,
            ...(durationType === 'real' ? {} : { duration }),
            durationType,
            ...estimatedCosts,
            inputs,
            outputs,
            status: params.status || 'active',
            modifiedAt: new Date(),
            modifiedBy: userId,
          },
          ...(durationType === 'real' ? { $unset: { duration: 1 } } : {}),
        },
      );

      const job = await models.Jobs.getJob(_id);
      sendDbEventLog({
        action: 'update',
        docId: _id,
        currentDocument: plainJob(job),
        prevDocument: plainJob(existing),
      });
      return job;
    }

    public static async removeJob(_id: string) {
      const job = await models.Jobs.findOneAndDelete({ _id });
      if (!job) throw new Error('Job not found');
      sendDbEventLog({
        action: 'delete',
        docId: _id,
        prevDocument: plainJob(job),
      });
      return { deletedCount: 1 };
    }
  }

  jobSchema.loadClass(Job);

  return jobSchema;
};
