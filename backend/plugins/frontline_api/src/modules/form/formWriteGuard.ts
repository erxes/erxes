import { randomUUID } from 'node:crypto';
import type { ClientSession, Connection } from 'mongoose';
import type { IModels } from '~/connectionResolvers';
import { conversionError } from './inspectFieldConversion';

const capabilities = new WeakMap<Connection, Promise<boolean>>();
const LEASE_MS = 120_000;

export const supportsFormTransactions = (models: IModels): Promise<boolean> => {
  const connection = models.Forms.db;
  let result = capabilities.get(connection);
  if (!result) {
    result = (async () => {
      if (!connection.db) throw new Error('Database is not connected');
      const hello: { setName?: string; msg?: string } =
        await connection.db.command({ hello: 1 });
      return Boolean(hello.setName || hello.msg === 'isdbgrid');
    })().catch((error: unknown) => {
      capabilities.delete(connection);
      throw error;
    });
    capabilities.set(connection, result);
  }
  return result;
};

export const requireFormTransactions = async (
  models: IModels,
): Promise<void> => {
  if (!(await supportsFormTransactions(models))) {
    throw conversionError(
      'TRANSACTIONS_REQUIRED',
      'Field conversion requires a MongoDB replica set or mongos. No changes were saved.',
    );
  }
};

const changedForm = () =>
  conversionError(
    'FORM_CHANGED',
    'The form is receiving submissions or changed during validation. Try saving again. No changes were saved.',
  );

// Like core's document migration, every database operation in the callback
// must use this session. Never put tRPC calls or notifications in the callback:
// MongoDB may retry it after a write conflict.
export const runFormTransaction = async <Result>(
  models: IModels,
  write: (session: ClientSession) => Promise<Result>,
): Promise<Result> => {
  const session = await models.Forms.db.startSession();
  try {
    return await session.withTransaction(() => write(session), {
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' },
      readPreference: 'primary',
      maxCommitTimeMS: 5000,
      timeoutMS: 10_000,
    });
  } finally {
    await session.endSession();
  }
};

export const claimFormConversion = async (
  models: IModels,
  formId: string,
  revision: number,
  session: ClientSession,
): Promise<void> => {
  const result = await models.Forms.updateOne(
    {
      _id: formId,
      $expr: { $eq: [{ $ifNull: ['$conversionRevision', 0] }, revision] },
      activeSubmissions: {
        $not: { $elemMatch: { expiresAt: { $gt: new Date() } } },
      },
    },
    {
      $inc: { conversionRevision: 1 },
      $set: { activeSubmissions: [] },
    },
    { session },
  );
  if (!result.matchedCount) throw changedForm();
};

export interface FormSubmissionGuard {
  commit<Result>(
    write: (session?: ClientSession) => Promise<Result>,
  ): Promise<Result>;
}

// Admission covers validation and external customer calls. Conversion refuses
// to commit while a live submission is admitted; normal submissions remain
// concurrent. Expired admissions cannot commit, even after a process resumes.
export const withFormSubmissionGuard = async <Result>(
  models: IModels,
  formId: string | string[],
  submit: (guard: FormSubmissionGuard) => Promise<Result>,
): Promise<Result> => {
  const formIds = [
    ...new Set((Array.isArray(formId) ? formId : [formId]).filter(Boolean)),
  ];
  if (!formIds.length || !(await supportsFormTransactions(models))) {
    return submit({ commit: (write) => write() });
  }
  const token = randomUUID();
  const admitted = await models.Forms.updateMany(
    { _id: { $in: formIds } },
    {
      $push: {
        activeSubmissions: {
          token,
          expiresAt: new Date(Date.now() + LEASE_MS),
        },
      },
    },
  );
  if (admitted.matchedCount !== formIds.length) {
    await models.Forms.updateMany(
      { _id: { $in: formIds } },
      { $pull: { activeSubmissions: { token } } },
    );
    throw new Error('Form not found');
  }
  let lost = false;
  const renewal = setInterval(() => {
    void models.Forms.updateMany(
      { _id: { $in: formIds }, 'activeSubmissions.token': token },
      {
        $set: {
          'activeSubmissions.$.expiresAt': new Date(Date.now() + LEASE_MS),
        },
      },
    )
      .then((result) => {
        if (result.matchedCount !== formIds.length) lost = true;
      })
      .catch(() => {
        lost = true;
      });
  }, LEASE_MS / 3);
  renewal.unref();
  try {
    return await submit({
      commit: (write) =>
        runFormTransaction(models, async (session) => {
          if (lost) throw changedForm();
          const claimed = await models.Forms.updateMany(
            {
              _id: { $in: formIds },
              activeSubmissions: {
                $elemMatch: { token, expiresAt: { $gt: new Date() } },
              },
            },
            { $inc: { conversionRevision: 1 } },
            { session },
          );
          if (claimed.matchedCount !== formIds.length) throw changedForm();
          return write(session);
        }),
    });
  } finally {
    clearInterval(renewal);
    await models.Forms.updateMany(
      { _id: { $in: formIds } },
      {
        $pull: {
          activeSubmissions: {
            $or: [{ token }, { expiresAt: { $lte: new Date() } }],
          },
        },
      },
    ).catch(() => {
      // Expiry releases a stranded admission. Cleanup must not turn an already
      // committed submission into an error that encourages a duplicate retry.
    });
  }
};
