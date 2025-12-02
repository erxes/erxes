import { Model } from 'mongoose';
import { exportSchema } from '../definitions/export';

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
  fileKeys: string[];
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
    fileIndex?: number,
  ): Promise<IExportDocument>;
}

export const loadExportClass = (models: any) => {
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
      const update: any = {};

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

      return models.Exports.findOneAndUpdate(
        { _id },
        { $set: update },
        { new: true },
      ).lean();
    }

    public static async saveExportFile(
      _id: string,
      fileKey: string,
      fileName: string,
      fileIndex?: number,
    ) {
      const update: any = {
        $push: { fileKeys: fileKey },
      };

      if (fileIndex === 0 || fileIndex === undefined) {
        update.$set = { fileName };
      }

      return models.Exports.findOneAndUpdate({ _id }, update, {
        new: true,
      }).lean();
    }
  }

  exportSchema.loadClass(Export);

  return exportSchema;
};
