import { ExpectedError, redis, sendWorkerQueue } from 'erxes-api-shared/utils';
import { AnyBulkWriteOperation, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  FILE_ACCESS_ROLES,
  FILE_PRINCIPAL_TYPES,
  FILES_ACCESS_SYNC_MAX_FOLDERS,
  FILES_ORG_ROOT_KEY,
  FILES_QUEUE,
  FILES_SPACES_TTL_SECONDS,
} from '@/files/constants';
import { IFileDocument } from '@/files/db/definitions/files';
import {
  fileFolderSchema,
  IFileAccessGrant,
  IFileFolderAppearance,
  IFileFolderDocument,
} from '@/files/db/definitions/folders';
import {
  assertRole,
  fileAccessPipeline,
  logAdminReads,
  mergeAccess,
  normalizeGrants,
  readFilter,
  roleOf,
  sameAccess,
  TFilesAccessGrantInput,
  TFilesActor,
  toAccessFields,
  toGrant,
  toRoleMap,
  withOwnerGrant,
} from '@/files/utils/access';

const MAX_NAME_LENGTH = 255;
const SHARED_WITH_ME_LIMIT = 500;
const BULK_CHUNK = 500;

export type TFilesAccessInput = {
  access?: TFilesAccessGrantInput[];
  restricted?: boolean;
};

export type TFilesSpaces = { myRootId: string; orgRootId: string };

export interface IFileFolderModel extends Model<IFileFolderDocument> {
  getFolder(_id: string): Promise<IFileFolderDocument>;
  getActiveFolder(_id: string): Promise<IFileFolderDocument>;
  ensureOrgRoot(): Promise<string>;
  ensureUserRoot(userId: string): Promise<IFileFolderDocument>;
  getSpaces(actor: TFilesActor): Promise<TFilesSpaces>;
  getReadableFolder(_id: string, actor: TFilesActor): Promise<IFileFolderDocument>;
  listFolders(parentId: string | undefined, actor: TFilesActor): Promise<IFileFolderDocument[]>;
  listSharedWithMe(actor: TFilesActor): Promise<IFileFolderDocument[]>;
  getPath(_id: string, actor: TFilesActor): Promise<IFileFolderDocument[]>;
  createFolder(
    doc: { name: string; parentId?: string } & TFilesAccessInput,
    actor: TFilesActor,
  ): Promise<IFileFolderDocument>;
  renameFolder(_id: string, name: string, actor: TFilesActor): Promise<IFileFolderDocument>;
  moveFolder(_id: string, parentId: string): Promise<IFileFolderDocument>;
  setAppearance(
    _id: string,
    appearance: IFileFolderAppearance,
    actor: TFilesActor,
  ): Promise<IFileFolderDocument>;
  setAccess(_id: string, doc: TFilesAccessInput, actor: TFilesActor): Promise<IFileFolderDocument>;
  setAppearanceMany(
    _ids: string[],
    appearance: IFileFolderAppearance,
    actor: TFilesActor,
  ): Promise<boolean>;
  refreshAccess(_id: string): Promise<void>;
  recomputeAccess(_id: string, options?: { topOnly?: boolean }): Promise<number>;
}

export const validateItemName = (name: string) => {
  const trimmed = (name || '').trim();

  if (!trimmed) {
    throw new ExpectedError('Name is required', 'FILES_INVALID_NAME');
  }

  if (trimmed.length > MAX_NAME_LENGTH || /[/\\]/.test(trimmed)) {
    throw new ExpectedError(
      `Name must be under ${MAX_NAME_LENGTH} characters and contain no slashes`,
      'FILES_INVALID_NAME',
    );
  }

  return trimmed;
};

const userRootKey = (userId: string) => `${FILE_PRINCIPAL_TYPES.USER}:${userId}`;

const isDuplicateKey = (e: unknown) =>
  typeof e === 'object' && e !== null && (e as { code?: number }).code === 11000;

const assertNotRoot = (folder: IFileFolderDocument) => {
  if (folder.rootKey) {
    throw new ExpectedError('A space root cannot be changed', 'FILES_ROOT_LOCKED');
  }
};

export const loadFileFolderClass = (models: IModels, subdomain: string) => {
  // Bump the version to rerun adoption after a deploy.
  const spacesKey = `files:spaces:v2:${subdomain}`;

  const inChunks = async <T>(ops: T[], write: (chunk: T[]) => Promise<unknown>) => {
    for (let i = 0; i < ops.length; i += BULK_CHUNK) {
      await write(ops.slice(i, i + BULK_CHUNK));
    }
  };

  const adoptLegacy = async (orgRootId: string) => {
    const legacy = { rootKey: { $exists: false }, access: { $exists: false } };

    await models.FileFolders.updateMany(
      { ...legacy, 'ancestorIds.0': { $ne: orgRootId } },
      [{ $set: { ancestorIds: { $concatArrays: [[orgRootId], '$ancestorIds'] } } }],
    );
    await models.FileFolders.updateMany(
      { ...legacy, parentId: { $in: [null, ''] } },
      { $set: { parentId: orgRootId } },
    );
    await models.Files.updateMany(
      { folderId: { $in: [null, ''] } },
      { $set: { folderId: orgRootId } },
    );
    // Last: this update is what marks a folder as adopted.
    const { modifiedCount } = await models.FileFolders.updateMany(legacy, [
      {
        $set: {
          restricted: false,
          access: [
            {
              type: FILE_PRINCIPAL_TYPES.USER,
              id: '$createdBy',
              role: FILE_ACCESS_ROLES.MANAGER,
              key: { $concat: [`${FILE_PRINCIPAL_TYPES.USER}:`, '$createdBy'] },
            },
          ],
        },
      },
    ]);

    const { modifiedCount: ownedFiles } = await models.Files.updateMany(
      { access: { $exists: false } },
      [
        {
          $set: {
            access: [
              {
                type: FILE_PRINCIPAL_TYPES.USER,
                id: '$createdBy',
                role: FILE_ACCESS_ROLES.MANAGER,
                key: { $concat: [`${FILE_PRINCIPAL_TYPES.USER}:`, '$createdBy'] },
              },
            ],
          },
        },
      ],
    );

    const hasLooseFiles = await models.Files.exists({
      folderId: orgRootId,
      'readers.0': { $exists: false },
    });

    if (modifiedCount || hasLooseFiles) {
      await models.FileFolders.refreshAccess(orgRootId);
    }

    if (ownedFiles) {
      const roots = await models.FileFolders.find(
        { rootKey: { $exists: true } },
        { _id: 1 },
      ).lean<{ _id: string }[]>();

      for (const root of roots) {
        await models.FileFolders.refreshAccess(root._id);
      }
    }
  };

  const createRoot = async (
    rootKey: string,
    name: string,
    grants: IFileAccessGrant[],
    createdBy: string,
  ) => {
    try {
      return await models.FileFolders.create({
        name,
        rootKey,
        ancestorIds: [],
        access: grants,
        restricted: true,
        ...toAccessFields(mergeAccess(null, grants)),
        createdBy,
      });
    } catch (e) {
      if (!isDuplicateKey(e)) {
        throw e;
      }

      const existing = await models.FileFolders.findOne({ rootKey });

      if (!existing) {
        throw e;
      }

      return existing;
    }
  };

  class FileFolderModel {
    public static async getFolder(_id: string) {
      const folder = await models.FileFolders.findOne({ _id });

      if (!folder) {
        throw new ExpectedError('Folder not found', 'NOT_FOUND');
      }

      return folder;
    }

    public static async getActiveFolder(_id: string) {
      const folder = await models.FileFolders.getFolder(_id);

      if (folder.deletedAt) {
        throw new ExpectedError('Folder is in trash', 'FILES_IN_TRASH');
      }

      return folder;
    }

    public static async ensureOrgRoot() {
      const cached = await redis.get(spacesKey);

      if (cached) {
        return cached;
      }

      const root =
        (await models.FileFolders.findOne({ rootKey: FILES_ORG_ROOT_KEY })) ||
        (await createRoot(
          FILES_ORG_ROOT_KEY,
          'Org drive',
          [toGrant(FILE_PRINCIPAL_TYPES.EVERYONE, FILE_ACCESS_ROLES.VIEWER)],
          'system',
        ));

      await adoptLegacy(root._id);
      await redis.set(spacesKey, root._id, 'EX', FILES_SPACES_TTL_SECONDS);

      return root._id;
    }

    public static async ensureUserRoot(userId: string) {
      const rootKey = userRootKey(userId);

      return (
        (await models.FileFolders.findOne({ rootKey })) ||
        createRoot(
          rootKey,
          'My files',
          [toGrant(FILE_PRINCIPAL_TYPES.USER, FILE_ACCESS_ROLES.MANAGER, userId)],
          userId,
        )
      );
    }

    public static async getSpaces(actor: TFilesActor) {
      const [orgRootId, myRoot] = await Promise.all([
        models.FileFolders.ensureOrgRoot(),
        models.FileFolders.ensureUserRoot(actor.userId),
      ]);

      return { orgRootId, myRootId: myRoot._id };
    }

    public static async getReadableFolder(_id: string, actor: TFilesActor) {
      const folder = await models.FileFolders.getFolder(_id);

      assertRole(actor, folder, FILE_ACCESS_ROLES.VIEWER, 'viewFolder', 'folder');

      return folder;
    }

    public static async listFolders(parentId: string | undefined, actor: TFilesActor) {
      const parent = parentId
        ? await models.FileFolders.getReadableFolder(parentId, actor)
        : await models.FileFolders.ensureUserRoot(actor.userId);

      const folders = await models.FileFolders.find({
        parentId: parent._id,
        deletedAt: null,
        ...readFilter(actor),
      })
        .sort({ name: 1 })
        .lean<IFileFolderDocument[]>();

      logAdminReads(actor, 'listFolders', 'folder', folders);

      return folders;
    }

    public static async listSharedWithMe(actor: TFilesActor) {
      const candidates = await models.FileFolders.find({
        'access.key': { $in: actor.principals },
        // Own items carry an owner grant and would fill the limit before shared ones.
        createdBy: { $ne: actor.userId },
        rootKey: { $exists: false },
        deletedAt: null,
      })
        .limit(SHARED_WITH_ME_LIMIT)
        .lean<IFileFolderDocument[]>();

      const parentIds = [...new Set(candidates.map((f) => f.parentId).filter(Boolean))];
      const visibleParents = new Set(
        (
          await models.FileFolders.find(
            { _id: { $in: parentIds }, readers: { $in: actor.principals } },
            { _id: 1 },
          ).lean<{ _id: string }[]>()
        ).map((f) => f._id),
      );
      const entries = candidates.filter((f) => !f.parentId || !visibleParents.has(f.parentId));

      const ancestorIds = [...new Set(entries.flatMap((f) => f.ancestorIds))];
      const trashed = new Set(
        (
          await models.FileFolders.find(
            { _id: { $in: ancestorIds }, deletedAt: { $ne: null } },
            { _id: 1 },
          ).lean<{ _id: string }[]>()
        ).map((f) => f._id),
      );

      return entries
        .filter((f) => !f.ancestorIds.some((id) => trashed.has(id)))
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    public static async getPath(_id: string, actor: TFilesActor) {
      const folder = await models.FileFolders.getReadableFolder(_id, actor);
      const ancestors = await models.FileFolders.find({
        _id: { $in: folder.ancestorIds },
      }).lean<IFileFolderDocument[]>();
      const byId = new Map(ancestors.map((a) => [a._id, a]));
      const chain = [
        ...folder.ancestorIds
          .map((id) => byId.get(id))
          .filter((a): a is IFileFolderDocument => !!a),
        folder.toObject<IFileFolderDocument>(),
      ];

      if (actor.isAdmin) {
        logAdminReads(actor, 'folderPath', 'folder', chain);

        return chain;
      }

      const hidden = chain.map((f) => !!roleOf(f, actor.principals)).lastIndexOf(false);

      return chain.slice(hidden + 1);
    }

    public static async createFolder(
      {
        name,
        parentId,
        access = [],
        restricted,
      }: { name: string; parentId?: string } & TFilesAccessInput,
      actor: TFilesActor,
    ) {
      const parent = parentId
        ? await models.FileFolders.getActiveFolder(parentId)
        : await models.FileFolders.ensureUserRoot(actor.userId);

      assertRole(actor, parent, FILE_ACCESS_ROLES.CONTRIBUTOR, 'createFolder', 'folder');

      const grants = normalizeGrants(withOwnerGrant(access, actor.userId));

      return models.FileFolders.create({
        name: validateItemName(name),
        parentId: parent._id,
        ancestorIds: [...parent.ancestorIds, parent._id],
        access: grants,
        restricted: !!restricted,
        ...toAccessFields(mergeAccess(restricted ? null : toRoleMap(parent), grants)),
        createdBy: actor.userId,
      });
    }

    public static async renameFolder(_id: string, name: string, actor: TFilesActor) {
      const folder = await models.FileFolders.getActiveFolder(_id);

      assertNotRoot(folder);
      assertRole(actor, folder, FILE_ACCESS_ROLES.MANAGER, 'renameFolder', 'folder');

      await models.FileFolders.updateOne(
        { _id },
        { $set: { name: validateItemName(name) } },
      );

      return models.FileFolders.getFolder(_id);
    }

    public static async setAppearance(
      _id: string,
      { color, icon, coverFileId }: IFileFolderAppearance,
      actor: TFilesActor,
    ) {
      const folder = await models.FileFolders.getActiveFolder(_id);

      assertRole(actor, folder, FILE_ACCESS_ROLES.MANAGER, 'folderAppearance', 'folder');

      if (color && !/^#[0-9a-f]{6}$/i.test(color)) {
        throw new ExpectedError('Color must be a hex value like #3b82f6', 'FILES_INVALID_APPEARANCE');
      }

      if (icon && !/^[A-Za-z0-9]{1,64}$/.test(icon)) {
        throw new ExpectedError('Unknown icon', 'FILES_INVALID_APPEARANCE');
      }

      if (coverFileId) {
        const cover = await models.Files.findOne({ _id: coverFileId, deletedAt: null }).lean<
          IFileDocument | null
        >();

        if (!cover || !/^image\/(png|jpeg|gif|webp)$/.test(cover.mimeType)) {
          throw new ExpectedError('Cover must be an image from Files', 'FILES_INVALID_APPEARANCE');
        }

        assertRole(actor, cover, FILE_ACCESS_ROLES.VIEWER, 'folderAppearance', 'file');
      }

      await models.FileFolders.updateOne(
        { _id },
        { $set: { appearance: { color: color || undefined, icon: icon || undefined, coverFileId: coverFileId || undefined } } },
      );

      return models.FileFolders.getFolder(_id);
    }

    public static async setAppearanceMany(
      _ids: string[],
      appearance: IFileFolderAppearance,
      actor: TFilesActor,
    ) {
      const folders = await models.FileFolders.find({ _id: { $in: _ids }, deletedAt: null }).lean<
        IFileFolderDocument[]
      >();

      folders.forEach((folder) =>
        assertRole(actor, folder, FILE_ACCESS_ROLES.MANAGER, 'folderAppearance', 'folder'),
      );

      for (const folder of folders) {
        await models.FileFolders.setAppearance(folder._id, appearance, actor);
      }

      return true;
    }

    public static async setAccess(
      _id: string,
      { access = [], restricted }: TFilesAccessInput,
      actor: TFilesActor,
    ) {
      const folder = await models.FileFolders.getActiveFolder(_id);

      assertRole(actor, folder, FILE_ACCESS_ROLES.MANAGER, 'setAccess', 'folder');

      if (folder.rootKey && folder.rootKey !== FILES_ORG_ROOT_KEY) {
        throw new ExpectedError(
          'My files stays private; share a folder inside it instead',
          'FILES_ROOT_LOCKED',
        );
      }

      await models.FileFolders.updateOne(
        { _id },
        {
          $set: {
            access: normalizeGrants(withOwnerGrant(access, folder.rootKey ? undefined : folder.createdBy)),
            restricted: folder.rootKey ? true : !!restricted,
          },
        },
      );

      await models.FileFolders.refreshAccess(_id);

      return models.FileFolders.getFolder(_id);
    }

    public static async moveFolder(_id: string, parentId: string) {
      const folder = await models.FileFolders.getFolder(_id);
      const parent = await models.FileFolders.getActiveFolder(parentId);

      assertNotRoot(folder);

      if (parent._id === _id || parent.ancestorIds.includes(_id)) {
        throw new ExpectedError(
          'A folder cannot be moved into itself',
          'FILES_INVALID_MOVE',
        );
      }

      const ancestorIds = [...parent.ancestorIds, parent._id];

      await models.FileFolders.updateOne(
        { _id },
        { $set: { parentId: parent._id, ancestorIds } },
      );

      await models.FileFolders.updateMany({ ancestorIds: folder._id }, [
        {
          $set: {
            ancestorIds: {
              $concatArrays: [
                [...ancestorIds, folder._id],
                {
                  $slice: [
                    '$ancestorIds',
                    { $add: [{ $indexOfArray: ['$ancestorIds', folder._id] }, 1] },
                    { $size: '$ancestorIds' },
                  ],
                },
              ],
            },
          },
        },
      ]);

      await models.FileFolders.refreshAccess(_id);

      return models.FileFolders.getFolder(_id);
    }

    public static async refreshAccess(_id: string) {
      const count = await models.FileFolders.countDocuments({ ancestorIds: _id });

      if (count <= FILES_ACCESS_SYNC_MAX_FOLDERS) {
        await models.FileFolders.recomputeAccess(_id);

        return;
      }

      await models.FileFolders.recomputeAccess(_id, { topOnly: true });
      await sendWorkerQueue('core', FILES_QUEUE).add(
        'access',
        { subdomain, folderId: _id },
        { removeOnComplete: 100, removeOnFail: 100 },
      );
    }

    public static async recomputeAccess(_id: string, { topOnly }: { topOnly?: boolean } = {}) {
      const top = await models.FileFolders.findOne({ _id }).lean<IFileFolderDocument | null>();

      if (!top) {
        return 0;
      }

      const parent =
        top.parentId && !top.restricted
          ? await models.FileFolders.findOne(
              { _id: top.parentId },
              { readers: 1, contributors: 1, managers: 1 },
            ).lean<IFileFolderDocument | null>()
          : null;
      const descendants = topOnly
        ? []
        : await models.FileFolders.find(
            { ancestorIds: _id },
            {
              parentId: 1,
              ancestorIds: 1,
              access: 1,
              restricted: 1,
              readers: 1,
              contributors: 1,
              managers: 1,
            },
          ).lean<IFileFolderDocument[]>();

      // Parents first, so each folder finds its parent's result ready.
      const ordered = [
        top,
        ...descendants.sort((a, b) => a.ancestorIds.length - b.ancestorIds.length),
      ];
      const effective = new Map<string, ReturnType<typeof toRoleMap>>();
      const folderOps: AnyBulkWriteOperation<IFileFolderDocument>[] = [];
      const fileOps: AnyBulkWriteOperation<IFileDocument>[] = [];

      for (const folder of ordered) {
        const inherited =
          folder._id === top._id
            ? parent && toRoleMap(parent)
            : folder.restricted
              ? null
              : effective.get(folder.parentId || '') || null;
        const map = mergeAccess(inherited, folder.access || []);
        const fields = toAccessFields(map);

        effective.set(folder._id, map);

        if (!sameAccess(folder, fields)) {
          folderOps.push({ updateOne: { filter: { _id: folder._id }, update: { $set: fields } } });
        }

        fileOps.push({
          updateMany: { filter: { folderId: folder._id }, update: fileAccessPipeline(fields) },
        });
      }

      await inChunks(folderOps, (chunk) => models.FileFolders.bulkWrite(chunk, { ordered: false }));
      await inChunks(fileOps, (chunk) => models.Files.bulkWrite(chunk, { ordered: false }));

      return ordered.length;
    }
  }

  fileFolderSchema.loadClass(FileFolderModel);

  return fileFolderSchema;
};
