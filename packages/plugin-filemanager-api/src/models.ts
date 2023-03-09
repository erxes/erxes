import { Model } from 'mongoose';

import { Document, Schema } from 'mongoose';

interface IPermissionConfig {
  userIds?: string[];
  unitId: string;
}

interface IFolder {
  createdAt: Date;
  createdUserId: string;
  name: string;
  parentId: string;
  permissionConfig: IPermissionConfig;
}

const permissionConfigSchema = new Schema(
  {
    userIds: { type: [String] },
    unitId: { type: String }
  },
  { _id: false }
);

export interface IFolderDocument extends IFolder, Document {
  _id: string;
}

const folderSchema = new Schema({
  createdAt: { type: Date },
  createdUserId: { type: String },
  name: { type: String },
  parentId: { type: String },
  permissionConfig: { type: permissionConfigSchema }
});

export interface IFolderModel extends Model<IFolderDocument> {
  saveFolder({ _id, doc }): IFolderDocument;
  getFolder(selector): IFolderDocument;
}

export const loadFolderClass = models => {
  class Folder {
    public static async saveFolder({ _id, doc }) {
      if (_id) {
        await models.Folders.update({ _id }, { $set: doc });
        return models.Folders.findOne({ _id });
      }

      doc.createdAt = new Date();

      return models.Folders.create(doc);
    }

    public static async getFolder(selector) {
      const folder = await models.Folders.findOne(selector);

      if (!folder) {
        throw new Error('Folder not found');
      }

      return folder;
    }
  }

  folderSchema.loadClass(Folder);

  return folderSchema;
};

// =================== File ====================================
interface IFile {
  createdAt: Date;
  createdUserId: string;
  name: string;
  type: string;
  folderId?: string;
  url?: string;
  info?: object;
  contentType?: string;
  contentTypeId?: string;
  documentId?: string;
}

export interface IFileDocument extends IFile, Document {
  _id: string;
}

const fileSchema = new Schema({
  createdAt: { type: Date },
  createdUserId: { type: String },
  name: { type: String },
  type: { type: String },
  folderId: { type: String },
  url: { type: String },
  info: { type: Object },
  contentType: { type: String },
  contentTypeId: { type: String },
  documentId: { type: String },
  permissionConfig: { type: permissionConfigSchema }
});

export interface IFileModel extends Model<IFileDocument> {
  saveFile({ _id, doc }: { _id?: string; doc: any }): IFileDocument;
  getFile(selector): IFileDocument;
}

export const loadFileClass = models => {
  class File {
    public static async saveFile({ _id, doc }) {
      if (_id) {
        await models.Files.update({ _id }, { $set: doc });
        return models.Files.findOne({ _id });
      }

      doc.createdAt = new Date();

      return models.Files.create(doc);
    }

    public static async getFile(selector) {
      const file = await models.Files.findOne(selector);

      if (!file) {
        throw new Error('File not found');
      }

      return file;
    }
  }

  fileSchema.loadClass(File);

  return fileSchema;
};

// =================== Log ====================================
interface ILog {
  contentType: 'folder' | 'file';
  contentTypeId: string;
  createdAt: Date;
  userId: string;
  description: string;
}

export interface ILogDocument extends ILog, Document {
  _id: string;
}

const logSchema = new Schema({
  contentType: { type: String },
  contentTypeId: { type: String },
  createdAt: { type: Date },
  userId: { type: String },
  description: { type: String }
});

export interface ILogModel extends Model<ILogDocument> {
  createLog(doc): void;
}

export const loadLogClass = models => {
  class Log {
    public static async createLog(doc) {
      doc.createdAt = new Date();

      return models.Logs.create(doc);
    }
  }

  logSchema.loadClass(Log);

  return logSchema;
};
