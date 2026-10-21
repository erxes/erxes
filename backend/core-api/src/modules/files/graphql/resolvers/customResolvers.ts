import { IContext } from '~/connectionResolvers';
import {
  FILE_ACCESS_ROLES,
  FILES_ORG_ROOT_KEY,
  FILES_THUMBNAIL_URL_WINDOW_MS,
} from '@/files/constants';
import { IFileDocument } from '@/files/db/definitions/files';
import { IFileFolderDocument, IFilesAccessFields } from '@/files/db/definitions/folders';
import { getFilesStorage, signRead, TFilesStorage } from '@/files/utils/storage';
import {
  getFilesActor,
  grantFromKey,
  myRole,
  roleFromRank,
  roleOf,
  toRoleMap,
} from '@/files/utils/access';

const storageByRequest = new WeakMap<IContext, Promise<TFilesStorage>>();

const storageFor = (context: IContext) => {
  let storage = storageByRequest.get(context);

  if (!storage) {
    storage = getFilesStorage(context.models);
    storageByRequest.set(context, storage);
  }

  return storage;
};

const linkBatches = new WeakMap<IContext, { ids: Set<string>; linked: Promise<Set<string>> }>();

const hasPublicLink = async (fileId: string, context: IContext) => {
  let batch = linkBatches.get(context);

  if (!batch) {
    const ids = new Set<string>();
    const linked = Promise.resolve().then(() => {
      linkBatches.delete(context);

      return context.models.FileShares.withActiveLink([...ids]);
    });

    batch = { ids, linked };
    linkBatches.set(context, batch);
  }

  batch.ids.add(fileId);

  return (await batch.linked).has(fileId);
};

const canSeeAccess = async (
  item: IFileFolderDocument | IFileDocument,
  context: IContext,
) => myRole(await getFilesActor(context), item) === FILE_ACCESS_ROLES.MANAGER;

const sharedWith = (item: Partial<IFilesAccessFields>) =>
  [...toRoleMap(item).entries()].map(([key, rank]) => grantFromKey(key, roleFromRank(rank)));

const parentAccess = async (folderId: string | undefined, context: IContext) => {
  if (!folderId) {
    return null;
  }

  const folder = await context.models.FileFolders.findOne(
    { _id: folderId },
    { readers: 1, contributors: 1, managers: 1 },
  ).lean<IFileFolderDocument | null>();

  return [...toRoleMap(folder).entries()].map(([key, rank]) =>
    grantFromKey(key, roleFromRank(rank)),
  );
};

export const filesCustomResolvers = {
  File: {
    async myRole(file: IFileDocument, _args: undefined, context: IContext) {
      return myRole(await getFilesActor(context), file);
    },

    sharedWith(file: IFileDocument) {
      return sharedWith(file);
    },

    publicLink(file: IFileDocument, _args: undefined, context: IContext) {
      return hasPublicLink(file._id, context);
    },

    async access(file: IFileDocument, _args: undefined, context: IContext) {
      return (await canSeeAccess(file, context)) ? file.access || [] : null;
    },

    async inheritedAccess(file: IFileDocument, _args: undefined, context: IContext) {
      return (await canSeeAccess(file, context)) ? parentAccess(file.folderId, context) : null;
    },

    async thumbnailUrl(file: IFileDocument, _args: undefined, context: IContext) {
      if (!file.thumbnailKey) {
        return null;
      }

      const windowStart =
        Math.floor(Date.now() / FILES_THUMBNAIL_URL_WINDOW_MS) * FILES_THUMBNAIL_URL_WINDOW_MS;

      // Valid for the rest of this window and the whole next one.
      return signRead(await storageFor(context), file.thumbnailKey, {
        fileName: `${file.name}.png`,
        contentType: 'image/png',
        inline: true,
        signingDate: new Date(windowStart),
        expiresIn: (2 * FILES_THUMBNAIL_URL_WINDOW_MS) / 1000,
      });
    },
  },

  FilesFolder: {
    async myRole(folder: IFileFolderDocument, _args: undefined, context: IContext) {
      return myRole(await getFilesActor(context), folder);
    },

    sharedWith(folder: IFileFolderDocument) {
      return sharedWith(folder);
    },

    space(folder: IFileFolderDocument) {
      if (!folder.rootKey) {
        return null;
      }

      return folder.rootKey === FILES_ORG_ROOT_KEY ? 'org' : 'personal';
    },

    async access(folder: IFileFolderDocument, _args: undefined, context: IContext) {
      return (await canSeeAccess(folder, context)) ? folder.access || [] : null;
    },

    async restricted(folder: IFileFolderDocument, _args: undefined, context: IContext) {
      return (await canSeeAccess(folder, context)) ? !!folder.restricted : null;
    },

    async inheritedAccess(folder: IFileFolderDocument, _args: undefined, context: IContext) {
      return (await canSeeAccess(folder, context)) ? parentAccess(folder.parentId, context) : null;
    },

    async coverUrl(folder: IFileFolderDocument, _args: undefined, context: IContext) {
      const coverFileId = folder.appearance?.coverFileId;

      if (!coverFileId) {
        return null;
      }

      const file = await context.models.Files.findOne(
        { _id: coverFileId, deletedAt: null },
        { name: 1, storageKey: 1, mimeType: 1, readers: 1 },
      ).lean<IFileDocument | null>();

      if (!file?.storageKey) {
        return null;
      }

      const actor = await getFilesActor(context);

      if (!actor.isAdmin && !roleOf(file, actor.principals)) {
        return null;
      }

      return signRead(await storageFor(context), file.storageKey, {
        fileName: file.name,
        contentType: file.mimeType,
        inline: true,
      });
    },
  },
};
