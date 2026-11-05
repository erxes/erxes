import { Model } from 'mongoose';
import { ITransaction } from '../../../accounting/@types/transaction';
import { fixNum } from 'erxes-api-shared/utils';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { getCoreConfig } from '~/init-trpc';
import { assertCanWriteTransactionAccounts } from '../../../accounting/utils/trPermissions';
import { IModels } from '~/connectionResolvers';
import {
  IJobExecution,
  IJobExecutionDocument,
  IJobExecutionItem,
} from '../../@types/jobExecutions';
import { activeCost } from '../../../accounting/utils/inventories';
import { getSingleJournalByAccount } from '../../../accounting/utils/utils';
import {
  buildJobExecutionTransactions,
  matchExecutionTransactionIds,
} from '../../utils/jobExecutionTransactions';
import {
  executionJobsInBaseUnits,
  getExecutionProductUnits,
} from '../../utils/jobExecutionUnits';

import { jobExecutionSchema } from '../definitions/jobExecutions';

interface PreparedExecution {
  doc: IJobExecution;
  journals: ReadonlyMap<string, string>;
}

export interface IJobExecutionModel extends Model<IJobExecutionDocument> {
  getJobExecution(_id: string): Promise<IJobExecutionDocument>;
  prepareExecution(
    input: IJobExecution,
    existing?: Pick<IJobExecutionDocument, 'jobs'>,
  ): Promise<PreparedExecution>;
  getTransactionDocs(
    execution: IJobExecution & { _id: string },
    journals: ReadonlyMap<string, string>,
    excludedTransactionIds?: string[],
  ): Promise<ITransaction[]>;
  saveTr(
    existing: IJobExecutionDocument,
    doc: IJobExecution,
    journals: ReadonlyMap<string, string>,
    userId: string,
  ): Promise<IJobExecutionDocument>;
  saveJobExecution(
    input: IJobExecution,
    userId: string,
    _id?: string,
  ): Promise<IJobExecutionDocument>;
  postJobExecution(_id: string, userId: string): Promise<IJobExecutionDocument>;
  undoJobExecution(_id: string, userId: string): Promise<IJobExecutionDocument>;
  removeJobExecution(_id: string): Promise<boolean>;
}

const plainExecution = (execution: IJobExecutionDocument) =>
  typeof execution.toObject === 'function' ? execution.toObject() : execution;

export const loadJobExecutionClass = (
  models: IModels,
  subdomain: string,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
  class JobExecution {
    public static async prepareExecution(
      input: IJobExecution,
      existing?: Pick<IJobExecutionDocument, 'jobs'>,
    ): Promise<PreparedExecution> {
      const date = new Date(input.date);
      if (!Number.isFinite(date.getTime()))
        throw new Error('A valid execution date is required');
      if (
        !Array.isArray(input.jobs) ||
        !input.jobs.length ||
        input.jobs.length > 100
      )
        throw new Error('Between 1 and 100 jobs are required');
      const rowIds = new Set(input.jobs.map((row) => row._id));
      if (
        rowIds.size !== input.jobs.length ||
        input.jobs.some((row) => !row._id?.trim())
      )
        throw new Error('Each execution job requires a unique row id');
      const previous = new Map(
        (existing?.jobs ?? []).map((row) => [row._id, row]),
      );
      const changedIds = [
        ...new Set(
          input.jobs
            .filter((row) => previous.get(row._id)?.jobId !== row.jobId)
            .map((row) => row.jobId),
        ),
      ];
      const templates = new Map(
        await Promise.all(
          changedIds.map(async (id) => {
            const job = await models.Jobs.getJob(id);
            if (job.status !== 'active')
              throw new Error('Select an active job');
            return [id, job] as const;
          }),
        ),
      );
      const items = (rows: IJobExecutionItem['inputs'], output = false) => {
        if (!Array.isArray(rows) || !rows.length || rows.length > 500)
          throw new Error('Between 1 and 500 product rows are required');
        return rows.map((row) => {
          if (
            !row.productId ||
            !Number.isFinite(row.quantity) ||
            row.quantity <= 0
          )
            throw new Error('Product and positive quantity are required');
          if (
            output &&
            (!Number.isFinite(row.costRatio) || (row.costRatio ?? -1) < 0)
          )
            throw new Error('Output cost ratios must be non-negative');
          return {
            productId: row.productId,
            uom: row.uom,
            quantity: row.quantity,
            costRatio: row.costRatio,
          };
        });
      };
      const costs = (rows: IJobExecutionItem['laborCosts']) => {
        if (!Array.isArray(rows) || rows.length > 500)
          throw new Error('Invalid cost rows');
        return rows.map((row) => {
          if (
            !row.name?.trim() ||
            !row.accountId ||
            !Number.isFinite(row.amount) ||
            row.amount < 0
          )
            throw new Error(
              'Cost name, account and non-negative amount are required',
            );
          return {
            name: row.name.trim(),
            accountId: row.accountId,
            amount: fixNum(row.amount, 4),
          };
        });
      };
      const jobs = input.jobs.map((row) => {
        if (!row.jobId || !Number.isFinite(row.quantity) || row.quantity <= 0)
          throw new Error('Job and positive production quantity are required');
        const inputs = items(row.inputs);
        const outputs = items(row.outputs, true);
        const totalRatio = outputs.reduce(
          (sum, row) => sum + (row.costRatio ?? 0),
          0,
        );
        if (!Number.isFinite(totalRatio) || totalRatio <= 0)
          throw new Error('Output ratios must have a positive total');
        return {
          _id: row._id,
          jobId: row.jobId,
          jobName:
            templates.get(row.jobId)?.name ?? previous.get(row._id)?.jobName,
          quantity: row.quantity,
          inputs,
          outputs,
          laborCosts: costs(row.laborCosts),
          overheadCosts: costs(row.overheadCosts),
        };
      });
      const laborCosts = jobs.flatMap((row) => row.laborCosts);
      const overheadCosts = jobs.flatMap((row) => row.overheadCosts);
      const accountIds = [
        ...new Set([
          input.inputAccountId,
          input.outputAccountId,
          ...laborCosts.map((row) => row.accountId),
          ...overheadCosts.map((row) => row.accountId),
        ]),
      ];
      const accounts = await Promise.all(
        accountIds.map((_id) =>
          models.Accounts.getAccount({
            _id,
            status: 'active',
            isOutBalance: false,
          }),
        ),
      );
      const inventoryAccounts = [
        input.inputAccountId,
        input.outputAccountId,
      ].map((_id) => accounts.find((account) => account._id === _id));
      if (inventoryAccounts.some((account) => account?.journal !== 'inventory'))
        throw new Error('Input and output accounts must be inventory accounts');
      const currency = inventoryAccounts[0]?.currency;
      if (accounts.some((account) => account.currency !== currency))
        throw new Error('All production accounts must use the same currency');
      const expenseAccounts = accounts.filter(
        (account) =>
          ![input.inputAccountId, input.outputAccountId].includes(account._id),
      );
      const expenseIds = new Set(
        [...laborCosts, ...overheadCosts].map((row) => row.accountId),
      );
      if (
        accounts.some(
          (account) =>
            expenseIds.has(account._id) &&
            !['main', 'tax', 'cash', 'bank', 'debt'].includes(account.journal),
        )
      )
        throw new Error('Cost accounts must support single journals');
      const journals = new Map(
        expenseAccounts.map((account) => [
          account._id,
          getSingleJournalByAccount(account.journal, account.kind),
        ]),
      );
      return {
        journals,
        doc: {
          date,
          jobs,
          description: input.description?.trim(),
          inputAccountId: input.inputAccountId,
          inputBranchId: input.inputBranchId || undefined,
          inputDepartmentId: input.inputDepartmentId || undefined,
          outputAccountId: input.outputAccountId,
          outputBranchId: input.outputBranchId || undefined,
          outputDepartmentId: input.outputDepartmentId || undefined,
        },
      };
    }

    public static async getTransactionDocs(
      execution: IJobExecution & { _id: string },
      journals: ReadonlyMap<string, string>,
      excludedTransactionIds: string[] = [],
    ): Promise<ITransaction[]> {
      const account = await models.Accounts.getAccount({
        _id: execution.inputAccountId,
      });
      const mainCurrency = await getCoreConfig(subdomain, 'mainCurrency', '');
      if (account.currency !== mainCurrency)
        throw new Error(
          'Production inventory accounts must use the main currency',
        );
      const productIds = [
        ...new Set(
          execution.jobs.flatMap((job) =>
            job.inputs.map((row) => row.productId),
          ),
        ),
      ];
      const costs = await activeCost(
        models,
        execution.inputAccountId,
        execution.inputBranchId,
        execution.inputDepartmentId,
        productIds,
        excludedTransactionIds,
      );
      return buildJobExecutionTransactions(execution, costs, journals);
    }

    public static async saveTr(
      existing: IJobExecutionDocument,
      doc: IJobExecution,
      journals: ReadonlyMap<string, string>,
      userId: string,
    ): Promise<IJobExecutionDocument> {
      const { _id } = existing;
      const locked = await models.JobExecutions.findOneAndUpdate(
        { _id, status: 'posted' },
        { $set: { status: 'posting', error: '' } },
        { new: true },
      ).lean();
      if (!locked) throw new Error('Execution is already being changed');
      let updating = false;
      try {
        if (!locked.parentId)
          throw new Error('Linked transaction group not found');
        const previous = await models.Transactions.find({
          parentId: locked.parentId,
        }).lean();
        const sources = previous.filter((row) => !row.originId);
        if (!sources.length)
          throw new Error('Linked transaction group not found');
        if (
          sources.some(
            (row) =>
              row.contentId !== _id || row.contentType !== 'jobExecution',
          )
        )
          throw new Error(
            'Linked transaction group was changed outside this execution',
          );
        const docs = await models.JobExecutions.getTransactionDocs(
          { ...doc, _id },
          journals,
          previous.map((row) => row._id),
        );
        const matched = matchExecutionTransactionIds(docs, sources);
        await assertCanWriteTransactionAccounts({
          models,
          userId,
          docs: matched,
          oldTrs: previous,
        });
        updating = true;
        const transactions = await models.Transactions.updatePTransaction(
          locked.parentId,
          matched,
          userId,
        );
        const first = transactions[0];
        if (!first) throw new Error('No production transactions were updated');
        await models.JobExecutions.updateOne(
          { _id },
          {
            $set: {
              ...doc,
              status: 'posted',
              parentId: first.parentId || locked.parentId,
              ptrId: first.ptrId || locked.ptrId,
              error: '',
              modifiedBy: userId,
              modifiedAt: new Date(),
            },
          },
        );
        const saved = await models.JobExecutions.getJobExecution(_id);
        sendDbEventLog({
          action: 'update',
          docId: _id,
          currentDocument: plainExecution(saved),
          prevDocument: plainExecution(existing),
        });
        return saved;
      } catch (error) {
        await models.JobExecutions.updateOne(
          { _id },
          {
            $set: {
              status: updating ? 'error' : 'posted',
              error: error instanceof Error ? error.message : 'Update failed',
            },
          },
        );
        throw error;
      }
    }

    public static async getJobExecution(_id: string) {
      const execution = await models.JobExecutions.findOne({ _id }).lean();
      if (!execution) throw new Error('Inventory execution not found');
      return execution;
    }

    public static async saveJobExecution(
      input: IJobExecution,
      userId: string,
      _id?: string,
    ) {
      const existing = _id
        ? await models.JobExecutions.getJobExecution(_id)
        : undefined;
      if (existing && !['draft', 'posted'].includes(existing.status))
        throw new Error('Only draft or posted executions can be edited');
      const { doc, journals } = await models.JobExecutions.prepareExecution(
        input,
        existing,
      );
      const { products, units } = await getExecutionProductUnits(
        subdomain,
        doc.jobs,
      );
      doc.jobs = executionJobsInBaseUnits(doc.jobs, products, units);
      if (!_id) {
        const saved = await models.JobExecutions.create({
          ...doc,
          status: 'draft',
          createdBy: userId,
          modifiedBy: userId,
        });
        sendDbEventLog({
          action: 'create',
          docId: saved._id,
          currentDocument: plainExecution(saved),
        });
        return saved;
      }
      if (!existing) throw new Error('Inventory execution not found');
      if (existing.status === 'posted')
        return models.JobExecutions.saveTr(existing, doc, journals, userId);
      const saved = await models.JobExecutions.findOneAndUpdate(
        { _id, status: 'draft' },
        {
          $set: {
            ...doc,
            modifiedAt: new Date(),
            modifiedBy: userId,
          },
        },
        { new: true },
      );
      if (!saved) throw new Error('Only draft executions can be edited');
      sendDbEventLog({
        action: 'update',
        docId: _id,
        currentDocument: plainExecution(saved),
        prevDocument: plainExecution(existing),
      });
      return saved;
    }

    public static async postJobExecution(_id: string, userId: string) {
      const existing = await models.JobExecutions.getJobExecution(_id);
      if (existing.status === 'posted') {
        const { doc, journals } = await models.JobExecutions.prepareExecution(
          existing,
          existing,
        );
        return models.JobExecutions.saveTr(existing, doc, journals, userId);
      }
      const execution = await models.JobExecutions.findOneAndUpdate(
        { _id, status: 'draft' },
        { $set: { status: 'posting', error: '' } },
        { new: true },
      ).lean();
      if (!execution) throw new Error('Execution is busy or cannot be posted');
      try {
        const { journals, doc } = await models.JobExecutions.prepareExecution(
          execution,
          execution,
        );
        if (
          await models.Transactions.exists({
            contentType: 'jobExecution',
            contentId: _id,
          })
        )
          throw new Error(
            'Linked transactions already exist; undo them before posting',
          );
        const docs = await models.JobExecutions.getTransactionDocs(
          { ...doc, _id },
          journals,
        );
        const transactions = await models.Transactions.createPTransaction(
          docs,
          userId,
        );
        const first = transactions[0];
        if (!first) throw new Error('No production transactions were created');
        await models.JobExecutions.updateOne(
          { _id },
          {
            $set: {
              status: 'posted',
              ptrId: first.ptrId,
              parentId: first.parentId,
              modifiedBy: userId,
              modifiedAt: new Date(),
              jobs: doc.jobs,
            },
          },
        );
        const saved = await models.JobExecutions.getJobExecution(_id);
        sendDbEventLog({
          action: 'update',
          docId: _id,
          currentDocument: plainExecution(saved),
          prevDocument: plainExecution(existing),
        });
        return saved;
      } catch (error) {
        const linked = await models.Transactions.exists({
          contentType: 'jobExecution',
          contentId: _id,
        });
        await models.JobExecutions.updateOne(
          { _id },
          {
            $set: {
              status: linked ? 'error' : 'draft',
              error: error instanceof Error ? error.message : 'Posting failed',
            },
          },
        );
        throw error;
      }
    }

    public static async undoJobExecution(_id: string, userId: string) {
      const execution = await models.JobExecutions.findOneAndUpdate(
        { _id, status: { $in: ['posted', 'error'] } },
        { $set: { status: 'undoing' } },
        { new: false },
      ).lean();
      if (!execution)
        throw new Error('Only posted or failed executions can be undone');
      try {
        const linked = await models.Transactions.findOne({
          $or: [
            { contentType: 'jobExecution', contentId: _id },
            ...(execution.parentId ? [{ parentId: execution.parentId }] : []),
          ],
        }).lean();
        if (linked) {
          const transactions = await models.Transactions.find({
            parentId: linked.parentId,
          }).lean();
          await assertCanWriteTransactionAccounts({
            models,
            userId,
            docs: transactions,
            oldTrs: transactions,
          });
          await models.Transactions.removePTransaction({
            parentId: linked.parentId,
          });
        }
        await models.JobExecutions.updateOne(
          { _id },
          {
            $set: {
              status: 'draft',
              error: '',
              modifiedBy: userId,
              modifiedAt: new Date(),
            },
            $unset: { parentId: 1, ptrId: 1 },
          },
        );
        const saved = await models.JobExecutions.getJobExecution(_id);
        sendDbEventLog({
          action: 'update',
          docId: _id,
          currentDocument: plainExecution(saved),
          prevDocument: plainExecution(execution),
        });
        return saved;
      } catch (error) {
        await models.JobExecutions.updateOne(
          { _id },
          {
            $set: {
              status: 'error',
              error: error instanceof Error ? error.message : 'Undo failed',
            },
          },
        );
        throw error;
      }
    }

    public static async removeJobExecution(_id: string) {
      const execution = await models.JobExecutions.findOneAndDelete({
        _id,
        status: 'draft',
      });
      if (!execution) throw new Error('Only draft executions can be deleted');
      sendDbEventLog({
        action: 'delete',
        docId: _id,
        prevDocument: plainExecution(execution),
      });
      return true;
    }
  }
  jobExecutionSchema.loadClass(JobExecution);
  return jobExecutionSchema;
};
