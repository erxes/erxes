import { IContext } from '~/connectionResolvers';
import {
  IAutomationFolderDocument,
  TAutomationFolderView,
} from '@/automations/db/models/AutomationFolders';

export const automationFolderQueries = {
  async automationFolders(
    _root: undefined,
    _args: undefined,
    { models, checkPermission }: IContext,
  ): Promise<TAutomationFolderView[]> {
    await checkPermission('automationsRead');

    return models.AutomationFolders.listFolders();
  },
};

export const automationFolderMutations = {
  async automationFoldersAdd(
    _root: undefined,
    { name, icon }: { name: string; icon?: string },
    { models, user, checkPermission }: IContext,
  ): Promise<IAutomationFolderDocument> {
    await checkPermission('automationsUpdate');

    return models.AutomationFolders.createFolder({
      name,
      icon,
      createdBy: user._id,
    });
  },

  async automationFoldersEdit(
    _root: undefined,
    { _id, name, icon }: { _id: string; name: string; icon?: string },
    { models, checkPermission }: IContext,
  ): Promise<IAutomationFolderDocument> {
    await checkPermission('automationsUpdate');

    return models.AutomationFolders.renameFolder(_id, { name, icon });
  },

  async automationFoldersRemove(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ): Promise<{ moved: number }> {
    await checkPermission('automationsUpdate');

    return models.AutomationFolders.removeFolder(_id);
  },

  async automationsMoveToFolder(
    _root: undefined,
    {
      automationIds,
      folderId,
    }: { automationIds: string[]; folderId?: string | null },
    { models, checkPermission }: IContext,
  ): Promise<{ moved: number }> {
    await checkPermission('automationsUpdate');

    return models.AutomationFolders.moveAutomations(
      automationIds,
      folderId || null,
    );
  },
};
