import { IModels } from '~/connectionResolvers';
import {
  buildImportUpdateDoc,
  readImportBulkOutcome,
} from '~/meta/import-export/utils';
import { prepareCustomerDoc } from './utils';

type OpMeta =
  | { row: any; type: 'insert' }
  | { row: any; type: 'update'; _id: any };

export async function processCustomerRows(
  models: IModels,
  rows: any[],
  state: 'lead' | 'customer',
): Promise<{ successRows: any[]; errorRows: any[] }> {
  const successRows: any[] = [];
  const errorRows: any[] = [];

  try {
    const emails = rows.map((r) => r.primaryEmail).filter((email) => email);
    const phones = rows.map((r) => r.primaryPhone).filter((phone) => phone);

    const existingDocs = await models.Customers.find({
      $or: [
        ...(emails.length > 0 ? [{ primaryEmail: { $in: emails } }] : []),
        ...(phones.length > 0 ? [{ primaryPhone: { $in: phones } }] : []),
      ],
    }).lean();

    const existingByEmail = new Map<string, any>();
    const existingByPhone = new Map<string, any>();

    for (const doc of existingDocs) {
      if (doc.primaryEmail) {
        existingByEmail.set(doc.primaryEmail, doc);
      }
      if (doc.primaryPhone) {
        existingByPhone.set(doc.primaryPhone, doc);
      }
    }

    const operations: any[] = [];
    const opMeta: OpMeta[] = [];

    const batchOpIndexByEmail = new Map<string, number>();
    const batchOpIndexByPhone = new Map<string, number>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const doc = await prepareCustomerDoc(models, row, state);

        const queuedIndex =
          (doc.primaryEmail && batchOpIndexByEmail.get(doc.primaryEmail)) ??
          (doc.primaryPhone && batchOpIndexByPhone.get(doc.primaryPhone));

        if (typeof queuedIndex === 'number') {
          const existingOp = operations[queuedIndex];
          if (existingOp.updateOne) {
            existingOp.updateOne.update.$set = {
              ...existingOp.updateOne.update.$set,
              ...doc,
              updatedAt: new Date(),
            };
          } else {
            existingOp.insertOne.document = {
              ...existingOp.insertOne.document,
              ...doc,
            };
          }
          opMeta[queuedIndex].row = { ...opMeta[queuedIndex].row, ...row };
          continue;
        }

        const existingDoc =
          (doc.primaryEmail && existingByEmail.get(doc.primaryEmail)) ||
          (doc.primaryPhone && existingByPhone.get(doc.primaryPhone));

        const opIndex = operations.length;

        if (existingDoc) {
          const updateDoc = buildImportUpdateDoc(existingDoc, doc);

          // an import must never downgrade an existing customer back to a lead
          delete updateDoc.state;

          operations.push({
            updateOne: {
              filter: { _id: existingDoc._id },
              update: { $set: updateDoc },
            },
          });
          opMeta.push({ row, type: 'update', _id: existingDoc._id });
        } else {
          operations.push({ insertOne: { document: doc } });
          opMeta.push({ row, type: 'insert' });
        }

        if (doc.primaryEmail) {
          batchOpIndexByEmail.set(doc.primaryEmail, opIndex);
        }
        if (doc.primaryPhone) {
          batchOpIndexByPhone.set(doc.primaryPhone, opIndex);
        }
      } catch (error: any) {
        errorRows.push({
          ...row,
          error: error.message || 'Failed to prepare row',
        });
      }
    }

    if (operations.length > 0) {
      let bulkResult: any;
      const failedIndexes = new Set<number>();

      try {
        bulkResult = await models.Customers.bulkWrite(operations, {
          ordered: false,
        });
      } catch (error: any) {
        bulkResult = error.result || {};
        for (const writeError of error.writeErrors || []) {
          if (typeof writeError.index === 'number') {
            failedIndexes.add(writeError.index);
            const meta = opMeta[writeError.index];
            errorRows.push({
              ...(meta?.row || {}),
              error:
                writeError.errmsg || writeError.message || 'Bulk write failed',
            });
          }
        }
      }

      for (let opIndex = 0; opIndex < opMeta.length; opIndex++) {
        if (failedIndexes.has(opIndex)) {
          continue;
        }

        const meta = opMeta[opIndex];
        const { error, insertedId } = readImportBulkOutcome({
          bulkResult,
          operationIndex: opIndex,
          isInsert: meta.type === 'insert',
        });

        if (error) {
          errorRows.push({ ...meta.row, error });
          continue;
        }

        successRows.push({
          ...meta.row,
          _id: meta.type === 'update' ? meta._id : insertedId,
        });
      }
    }

    return { successRows, errorRows };
  } catch (error: any) {
    return {
      successRows: [],
      errorRows: rows.map((row) => ({
        ...row,
        error: error.message || 'Failed to process rows',
      })),
    };
  }
}
