import { AUTOMATION_STATUSES } from 'erxes-api-shared/core-modules';
import { Document, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { automationFolderSchema } from '@/automations/db/definitions/automationFolder';

export interface IAutomationFolder {
  name: string;
  icon?: string;
  installationId?: string;
  createdBy?: string;
}

export interface IAutomationFolderDocument extends IAutomationFolder, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TAutomationFolderView = IAutomationFolder & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  automationCount: number;
  activeCount: number;
};

export interface IAutomationFolderModel
  extends Model<IAutomationFolderDocument> {
  getFolder(_id: string): Promise<IAutomationFolderDocument>;
  listFolders(): Promise<TAutomationFolderView[]>;
  createFolder(doc: IAutomationFolder): Promise<IAutomationFolderDocument>;
  renameFolder(
    _id: string,
    doc: Pick<IAutomationFolder, 'name' | 'icon'>,
  ): Promise<IAutomationFolderDocument>;
  removeFolder(_id: string): Promise<{ moved: number }>;
  moveAutomations(
    automationIds: string[],
    folderId: string | null,
  ): Promise<{ moved: number }>;
  removeIfEmpty(_id: string): Promise<boolean>;
}

// The same automations the list shows: not archived, not owned elsewhere
const LISTED_AUTOMATIONS = {
  status: { $nin: [AUTOMATION_STATUSES.ARCHIVED, 'template'] },
  ownedBy: { $exists: false },
};

const cleanName = (name: string) => {
  const trimmed = (name || '').trim();

  if (!trimmed) {
    throw new Error('Folder name is required');
  }

  return trimmed;
};

export const loadAutomationFolderClass = (models: IModels) => {
  class AutomationFolder {
    public static async getFolder(_id: string) {
      const folder = await models.AutomationFolders.findOne({ _id });

      if (!folder) {
        throw new Error('Folder not found');
      }

      return folder;
    }

    public static async listFolders(): Promise<TAutomationFolderView[]> {
      const folders = await models.AutomationFolders.find({})
        .sort({ name: 1 })
        .lean();

      if (!folders.length) {
        return [];
      }

      const counts: { _id: string; total: number; active: number }[] =
        await models.Automations.aggregate([
          {
            $match: {
              ...LISTED_AUTOMATIONS,
              folderId: { $in: folders.map(({ _id }) => _id) },
            },
          },
          {
            $group: {
              _id: '$folderId',
              total: { $sum: 1 },
              active: {
                $sum: {
                  $cond: [
                    { $eq: ['$status', AUTOMATION_STATUSES.ACTIVE] },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ]);
      const countOf = new Map(counts.map((count) => [count._id, count]));

      return folders.map((folder) => ({
        ...folder,
        automationCount: countOf.get(folder._id)?.total || 0,
        activeCount: countOf.get(folder._id)?.active || 0,
      }));
    }

    public static async createFolder(doc: IAutomationFolder) {
      return models.AutomationFolders.create({
        ...doc,
        name: cleanName(doc.name),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    public static async renameFolder(
      _id: string,
      { name, icon }: Pick<IAutomationFolder, 'name' | 'icon'>,
    ) {
      await models.AutomationFolders.getFolder(_id);

      await models.AutomationFolders.updateOne(
        { _id },
        {
          $set: {
            name: cleanName(name),
            ...(icon !== undefined ? { icon } : {}),
            updatedAt: new Date(),
          },
        },
      );

      return models.AutomationFolders.getFolder(_id);
    }

    /** Its automations stay, back at the top of the list. */
    public static async removeFolder(_id: string) {
      await models.AutomationFolders.getFolder(_id);

      const { modifiedCount } = await models.Automations.updateMany(
        { folderId: _id },
        { $unset: { folderId: '' } },
      );

      await models.AutomationFolders.deleteOne({ _id });

      return { moved: modifiedCount };
    }

    /** `null` takes them out of any folder. */
    public static async moveAutomations(
      automationIds: string[],
      folderId: string | null,
    ) {
      if (!automationIds.length) {
        return { moved: 0 };
      }

      if (folderId) {
        await models.AutomationFolders.getFolder(folderId);
      }

      const { modifiedCount } = await models.Automations.updateMany(
        { _id: { $in: automationIds } },
        folderId ? { $set: { folderId } } : { $unset: { folderId: '' } },
      );

      return { moved: modifiedCount };
    }

    public static async removeIfEmpty(_id: string) {
      const left = await models.Automations.countDocuments({ folderId: _id });

      if (left) {
        return false;
      }

      await models.AutomationFolders.deleteOne({ _id });

      return true;
    }
  }

  automationFolderSchema.loadClass(AutomationFolder);

  return automationFolderSchema;
};
