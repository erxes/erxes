import { Model } from 'mongoose';
import { importSchema } from '../definitions/import';

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

export const loadImportClass = (models: any) => {
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

      return models.Imports.findOneAndUpdate(
        { _id },
        { $set: update },
        { new: true },
      ).lean();
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
