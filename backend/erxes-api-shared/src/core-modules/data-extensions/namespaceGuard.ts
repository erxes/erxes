import { Document, Query, Schema } from 'mongoose';
import { DATA_EXTENSIONS_NAMESPACE } from './constants';

type UpdateDocument = Record<string, unknown>;

const isNamespacePath = (path: string) =>
  path === DATA_EXTENSIONS_NAMESPACE ||
  path.startsWith(`${DATA_EXTENSIONS_NAMESPACE}.`);

const isPlainObject = (value: unknown): value is UpdateDocument =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const mentionsNamespace = (value: unknown) =>
  JSON.stringify(value ?? null).includes(DATA_EXTENSIONS_NAMESPACE);

// Stages that only add or remove named fields keep every other path,
// including the namespace. $project, $replaceWith and friends rebuild the
// document and would drop it.
const PRESERVING_PIPELINE_STAGES = ['$set', '$addFields', '$unset'];

const assertPreservingPipeline = (pipeline: unknown[]) => {
  for (const stage of pipeline) {
    const operators = isPlainObject(stage) ? Object.keys(stage) : [];

    if (
      operators.length !== 1 ||
      !PRESERVING_PIPELINE_STAGES.includes(operators[0]) ||
      mentionsNamespace(stage)
    ) {
      throw new Error(
        `Update pipelines on records with ${DATA_EXTENSIONS_NAMESPACE} may only use $set, $addFields or $unset on other paths`,
      );
    }
  }
};

/**
 * Removes every namespace path from an update document. Values in the
 * namespace are written only by the Data Extensions owner path, which uses
 * the native driver and so never passes through this guard.
 */
export const stripDataExtensionsFromUpdate = <T>(update: T): T => {
  if (Array.isArray(update)) {
    assertPreservingPipeline(update);

    return update;
  }

  if (!isPlainObject(update)) {
    return update;
  }

  const sanitized: UpdateDocument = {};

  for (const [key, value] of Object.entries(update)) {
    if (!key.startsWith('$')) {
      if (!isNamespacePath(key)) {
        sanitized[key] = value;
      }

      continue;
    }

    if (!isPlainObject(value)) {
      sanitized[key] = value;
      continue;
    }

    const operatorValue: UpdateDocument = {};

    for (const [path, operand] of Object.entries(value)) {
      const renamesIntoNamespace =
        key === '$rename' &&
        typeof operand === 'string' &&
        isNamespacePath(operand);

      if (!isNamespacePath(path) && !renamesIntoNamespace) {
        operatorValue[path] = operand;
      }
    }

    if (Object.keys(operatorValue).length) {
      sanitized[key] = operatorValue;
    }
  }

  return sanitized as T;
};

const isHydratedDocument = (doc: unknown): doc is Document =>
  Boolean(doc) && typeof doc === 'object' && '$__' in (doc as object);

const stripFromDocument = (doc: unknown) => {
  if (isHydratedDocument(doc)) {
    doc.set(DATA_EXTENSIONS_NAMESPACE, undefined);
  } else if (isPlainObject(doc)) {
    delete doc[DATA_EXTENSIONS_NAMESPACE];
  }
};

const replacementError = () =>
  new Error(
    `Replacing a record would drop ${DATA_EXTENSIONS_NAMESPACE}; use an update instead`,
  );

type GuardedQuery = Query<unknown, unknown>;

/**
 * Declares the optional `dataExtensions` namespace on an owner schema and
 * reserves it: inserts, updates, replacements and bulk writes made through
 * the model cannot set or drop it, so unrelated edits preserve the values.
 */
export const applyDataExtensionsNamespace = (schema: Schema) => {
  schema.add({
    [DATA_EXTENSIONS_NAMESPACE]: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
  });

  schema.pre('save', function () {
    if (this.isNew) {
      stripFromDocument(this);
      return;
    }

    if (this.isModified(DATA_EXTENSIONS_NAMESPACE)) {
      throw new Error(
        `${DATA_EXTENSIONS_NAMESPACE} can only be changed through Data Extensions`,
      );
    }
  });

  schema.pre(
    ['updateOne', 'updateMany', 'findOneAndUpdate'],
    function (this: GuardedQuery) {
      const update = this.getUpdate();

      if (update) {
        this.setUpdate(stripDataExtensionsFromUpdate(update));
      }
    },
  );

  // Preserving the namespace across a replacement would need a read and a
  // write that a concurrent patch can slip between, so replacements are
  // refused. No owner path replaces these records.
  schema.pre(['replaceOne', 'findOneAndReplace'], function () {
    throw replacementError();
  });

  schema.pre('insertMany', function (next, docs) {
    for (const doc of Array.isArray(docs) ? docs : [docs]) {
      stripFromDocument(doc);
    }

    next();
  });

  schema.pre('bulkWrite', function (next, ops) {
    for (const op of ops) {
      if ('insertOne' in op && op.insertOne) {
        stripFromDocument(op.insertOne.document);
      } else if ('updateOne' in op && op.updateOne) {
        op.updateOne.update = stripDataExtensionsFromUpdate(
          op.updateOne.update,
        );
      } else if ('updateMany' in op && op.updateMany) {
        op.updateMany.update = stripDataExtensionsFromUpdate(
          op.updateMany.update,
        );
      } else if ('replaceOne' in op && op.replaceOne) {
        return next(replacementError());
      }
    }

    next();
  });
};
