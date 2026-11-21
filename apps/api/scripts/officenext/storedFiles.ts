/**
 * The old file managers' files → `core_files`, keeping the storage key (`files`) or URL
 * (`filemanager_files`) as the file's key, as attachments do (`files.ts`). Core files have no
 * folders or sharing, so a file belongs to the organisation and its maker. `file_versions` held
 * one version per file, the file's own key, so it adds nothing.
 */
import { z } from 'zod';
import { saveFiles } from './files';
import { resolve } from './idMap';
import { idSet, readAll, type Run, unit } from './run';
import { amount, createdOf, optionalId, readOr, record, text, when } from './values';

const DriveFile = record({
  name: text,
  mimeType: text,
  size: amount,
  status: text,
  storageKey: text,
  createdBy: optionalId,
  createdAt: when,
});

const ManagerFile = record({
  name: text,
  url: text,
  info: z.object({ type: text, size: amount }).partial().nullish(),
  createdUserId: optionalId,
  createdAt: when,
});

const Version = record({ fileId: optionalId, storageKey: text });

/** Files of both old file managers. */
export const importStoredFiles = async (run: Run) => {
  const members = await idSet(run, 'core_users');

  const member = (id: string | null) => {
    const user = id && resolve('user', id);

    return user && members.has(user) ? user : null;
  };

  const drive = (await readAll(run, 'files')).flatMap((raw) => readOr(DriveFile, raw) ?? []);

  const manager = (await readAll(run, 'filemanager_files')).flatMap(
    (raw) => readOr(ManagerFile, raw) ?? [],
  );

  run.report.of('files', 'core_files');
  run.report.seen('files', drive.length);
  run.report.of('filemanager_files', 'core_files');
  run.report.seen('filemanager_files', manager.length);

  const ready = drive.filter((file) => {
    if (file.status !== 'ready' || !file.storageKey)
      run.report.skip('files', 'upload never finished', file.id);

    return file.status === 'ready' && file.storageKey;
  });

  await unit(run, async () => {
    await saveFiles(
      run,
      'files',
      ready.map((file) => ({
        attachment: { url: file.storageKey, name: file.name, type: file.mimeType, size: file.size },
        actorId: member(file.createdBy),
        at: createdOf(file.id, file.createdAt),
      })),
    );
    await saveFiles(
      run,
      'filemanager_files',
      manager.map((file) => ({
        attachment: {
          url: file.url,
          name: file.name,
          type: file.info?.type ?? null,
          size: file.info?.size ?? null,
        },
        actorId: member(file.createdUserId),
        at: createdOf(file.id, file.createdAt),
      })),
    );
  });

  const keys = new Set(ready.map((file) => file.storageKey));

  const versions = (await readAll(run, 'file_versions')).flatMap(
    (raw) => readOr(Version, raw) ?? [],
  );

  run.report.of('file_versions', 'core_files');
  run.report.seen('file_versions', versions.length);

  for (const version of versions) {
    run.report.skip(
      'file_versions',
      keys.has(version.storageKey)
        ? "the file's own version (same key, already in core_files)"
        : 'an older version: core files keep one version',
      version.id,
    );
  }
};
