import { db } from '@erxes/core-db';
import { fileSettingsOf, updateFileSettings } from '~/modules/files/fileSettings';
import {
  completeUpload,
  createUpload,
  getFile,
  listFiles,
  removeFile,
} from '~/modules/files/files.service';
import { scoped } from '~/orpc';

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
};
