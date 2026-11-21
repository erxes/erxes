import { db } from '@erxes/core-db';
import { removeBucket, saveBucket } from '~/modules/files/bucketSettings';
import { fileSettingsOf, updateFileSettings } from '~/modules/files/fileSettings';
import {
  completeUpload,
  createUpload,
  getFile,
  listFiles,
  removeFile,
} from '~/modules/files/files.service';
import { scoped, unscoped } from '~/orpc';

export const filesRouter = {
  createUpload: scoped.files.createUpload.handler(({ input }) => createUpload(db(), input)),
  complete: scoped.files.complete.handler(({ input }) => completeUpload(db(), input.id)),
  get: scoped.files.get.handler(({ input }) => getFile(db(), input.id)),
  list: scoped.files.list.handler(({ input }) => listFiles(db(), input.ids)),
  remove: scoped.files.remove.handler(({ input }) => removeFile(db(), input.id)),
  settings: scoped.files.settings.handler(() => fileSettingsOf(db())),
  updateSettings: scoped.files.updateSettings.handler(({ input }) =>
    updateFileSettings(db(), input),
  ),
  // Writes a test file to the bucket: no transaction held meanwhile.
  saveBucket: unscoped.files.saveBucket.handler(({ input }) => saveBucket(input)),
  removeBucket: scoped.files.removeBucket.handler(() => removeBucket(db())),
};
