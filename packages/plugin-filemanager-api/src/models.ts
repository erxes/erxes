import { Model } from 'mongoose';

import { Document, Schema } from 'mongoose';

interface IFolder {
  createdAt: Date;
  createdUserId: string;
  name: string;
  parentId: string;
}

export interface IFolderDocument extends IFolder, Document {
  _id: string;
}

const folderSchema = new Schema({
  createdAt: { type: Date },
  createdUserId: { type: String },
  name: { type: String },
  parentId: { type: String }
});

export interface IFolderModel extends Model<IFolderDocument> {
  saveFolder({ _id, doc }): void;
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
  }

  folderSchema.loadClass(Folder);

  return folderSchema;
};

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
  documentId: { type: String }
});

export interface IFileModel extends Model<IFileDocument> {
  saveFile({ _id, doc }: { _id?: string; doc: any }): void;
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
  }

  fileSchema.loadClass(File);

  return fileSchema;
};
