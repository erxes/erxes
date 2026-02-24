import { Model } from 'mongoose';
import { exportSchema } from '../definitions/export';
import { IModels } from '~/connectionResolvers';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';

export interface IExportDocument {
  _id: string;
  entityType: string;
  pluginName: string;
  moduleName: string;
  collectionName: string;
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
  fileFormat: 'csv' | 'xlsx';
  fileKey?: string;
  filters?: Record<string, any>;
  ids: string[];
  selectedFields?: string[];
  startedAt?: Date;
  completedAt?: Date;
  userId: string;
  subdomain: string;
  jobId?: string;
  createdAt: Date;
  updatedAt: Date;
  errorMessage?: string;
  lastCursor?: string;
}

export interface IExportModel extends Model<IExportDocument> {
  getExport(_id: string): Promise<IExportDocument | null>;
  updateExportProgress(
    _id: string,
    progress: {
      processedRows?: number;
      totalRows?: number;
      status?: IExportDocument['status'];
      errorMessage?: string;
    },
  ): Promise<IExportDocument>;
  saveExportFile(
    _id: string,
    fileKey: string,
    fileName: string,
  ): Promise<IExportDocument>;
}

const buildNotificationMessage = (exportDoc: IExportDocument): string => {
  if (exportDoc.status === 'completed') {
    const recordsText =
      exportDoc.totalRows > 0
        ? ` ${exportDoc.totalRows.toLocaleString()} records exported.`
        : '';
    return `Your export "${exportDoc.fileName}" has been completed successfully.${recordsText}`;
  }

  if (exportDoc.errorMessage) {
    return `Export "${exportDoc.fileName}" failed: ${exportDoc.errorMessage}`;
  }

  return `Export "${exportDoc.fileName}" failed. Please try again or contact support if the issue persists.`;
};

const buildNotificationMetadata = (exportDoc: IExportDocument) => ({
  exportId: exportDoc._id,
  fileName: exportDoc.fileName,
  status: exportDoc.status,
  processedRows: exportDoc.processedRows,
  totalRows: exportDoc.totalRows,
  errorMessage: exportDoc.errorMessage,
  fileKey: exportDoc.fileKey,
  fileFormat: exportDoc.fileFormat,
});

export const loadExportClass = (
  models: IModels,
  { sendNotificationMessage }: EventDispatcherReturn,
) => {
  class Export {
    public static async getExport(_id: string) {
      return models.Exports.findOne({ _id }).lean();
    }

    public static async updateExportProgress(
      _id: string,
      progress: {
        processedRows?: number;
        totalRows?: number;
        status?: IExportDocument['status'];
        errorMessage?: string;
        lastCursor?: string;
      },
    ) {
      const update: Record<string, any> = {};

      if (progress.processedRows !== undefined) {
        update.processedRows = progress.processedRows;
      }

      if (progress.totalRows !== undefined) {
        update.totalRows = progress.totalRows;
      }

      if (progress.errorMessage !== undefined) {
        update.errorMessage = progress.errorMessage;
      }

      if (progress.lastCursor !== undefined) {
        update.lastCursor = progress.lastCursor;
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

      const exportDoc = await models.Exports.findOneAndUpdate(
        { _id },
        { $set: update },
        { new: true },
      ).lean();

      if (
        exportDoc &&
        (exportDoc.status === 'completed' || exportDoc.status === 'failed')
      ) {
        const isCompleted = exportDoc.status === 'completed';

        sendNotificationMessage({
          userIds: [exportDoc.userId],
          title: isCompleted ? 'Export completed' : 'Export failed',
          message: buildNotificationMessage(exportDoc),
          type: isCompleted ? 'success' : 'error',
          priority: 'low',
          kind: 'system',
          contentType: 'core:import-export.exports',
          metadata: buildNotificationMetadata(exportDoc),
        });
      }

      return exportDoc;
    }

    public static async saveExportFile(
      _id: string,
      fileKey: string,
      fileName: string,
    ) {
      return models.Exports.findOneAndUpdate(
        { _id },
        {
          $set: { fileKey, fileName },
        },
        {
          new: true,
        },
      ).lean();
    }
  }

  exportSchema.loadClass(Export);

  return exportSchema;
};
