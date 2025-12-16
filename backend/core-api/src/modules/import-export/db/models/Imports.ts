import { Model } from 'mongoose';
import { importSchema } from '../definitions/import';
import { IModels } from '~/connectionResolvers';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';

export interface IImportDocument {
  _id: string;
  entityType: string;
  pluginName: string;
  moduleName: string;
  collectionName: string;
  fileKey: string;
  fileName: string;
  status:
    | 'pending'
    | 'validating'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'cancelled';
  totalRows: number;
  processedRows: number;
  successRows: number;
  errorRows: number;
  importedIds: string[];
  errorFileUrl?: string;
  startedAt?: Date;
  completedAt?: Date;
  userId: string;
  subdomain: string;
  jobId?: string;
  createdAt: Date;
  updatedAt: Date;
  errorMessage?: string;
}

export interface IImportModel extends Model<IImportDocument> {
  getImport(_id: string): Promise<IImportDocument | null>;
  updateImportProgress(
    _id: string,
    progress: {
      processedRows?: number;
      successRows?: number;
      errorRows?: number;
      totalRows?: number;
      status?: IImportDocument['status'];
      errorMessage?: string;
      errorFileUrl?: string;
    },
  ): Promise<IImportDocument>;
  addImportedIds(_id: string, recordIds: string[]): Promise<void>;
}

const buildNotificationMessage = (importDoc: IImportDocument): string => {
  if (importDoc.status === 'completed') {
    const recordsText =
      importDoc.successRows > 0
        ? ` ${importDoc.successRows.toLocaleString()} records imported successfully.`
        : '';
    const errorText =
      importDoc.errorRows > 0
        ? ` ${importDoc.errorRows.toLocaleString()} records failed.`
        : '';
    return `Your import "${importDoc.fileName}" has been completed.${recordsText}${errorText}`;
  }

  if (importDoc.errorMessage) {
    return `Import "${importDoc.fileName}" failed: ${importDoc.errorMessage}`;
  }

  return `Import "${importDoc.fileName}" failed. Please try again or contact support if the issue persists.`;
};

const buildNotificationMetadata = (importDoc: IImportDocument) => ({
  importId: importDoc._id,
  fileName: importDoc.fileName,
  status: importDoc.status,
  processedRows: importDoc.processedRows,
  successRows: importDoc.successRows,
  errorRows: importDoc.errorRows,
  totalRows: importDoc.totalRows,
  errorMessage: importDoc.errorMessage,
  errorFileUrl: importDoc.errorFileUrl,
});

export const loadImportClass = (
  models: IModels,
  { sendNotificationMessage }: EventDispatcherReturn,
) => {
  class Import {
    public static async getImport(_id: string) {
      return models.Imports.findOne({ _id }).lean();
    }

    public static async updateImportProgress(
      _id: string,
      progress: {
        processedRows?: number;
        successRows?: number;
        errorRows?: number;
        totalRows?: number;
        status?: IImportDocument['status'];
        errorMessage?: string;
        errorFileUrl?: string;
      },
    ) {
      const update: any = {};

      if (progress.processedRows !== undefined) {
        update.processedRows = progress.processedRows;
      }

      if (progress.successRows !== undefined) {
        update.successRows = progress.successRows;
      }

      if (progress.errorRows !== undefined) {
        update.errorRows = progress.errorRows;
      }

      if (progress.totalRows !== undefined) {
        update.totalRows = progress.totalRows;
      }

      if (progress.errorMessage !== undefined) {
        update.errorMessage = progress.errorMessage;
      }

      if (progress.errorFileUrl !== undefined) {
        update.errorFileUrl = progress.errorFileUrl;
      }

      if (progress.status) {
        update.status = progress.status;
        if (progress.status === 'processing' && !update.startedAt) {
          update.startedAt = new Date();
        }
        if (progress.status === 'completed' || progress.status === 'failed') {
          update.completedAt = new Date();
        }
      }

      const importDoc = await models.Imports.findOneAndUpdate(
        { _id },
        { $set: update },
        { new: true },
      ).lean();

      if (
        importDoc &&
        (importDoc.status === 'completed' || importDoc.status === 'failed')
      ) {
        const isCompleted = importDoc.status === 'completed';

        sendNotificationMessage({
          userIds: [importDoc.userId],
          title: isCompleted ? 'Import completed' : 'Import failed',
          message: buildNotificationMessage(importDoc),
          type: isCompleted ? 'success' : 'error',
          priority: 'low',
          kind: 'system',
          contentType: 'core:import-export.imports',
          metadata: buildNotificationMetadata(importDoc),
        });
      }

      return importDoc;
    }

    public static async addImportedIds(_id: string, recordIds: string[]) {
      await models.Imports.updateOne(
        { _id },
        { $push: { importedIds: { $each: recordIds } } },
      );
    }
  }

  importSchema.loadClass(Import);

  return importSchema;
};
