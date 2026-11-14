import { db } from '@erxes/core-db';
import { getFileSettings, updateFileSettings } from '~/modules/files/fileSettings';
import {
  completeUpload,
  createUpload,
  getFile,
  listFiles,
  removeFile,
} from '~/modules/files/files.service';
import { authed, anyone } from '~/orpc';

export const filesRouter = {
  createUpload: anyone.files.createUpload.handler(({ input, context }) =>
    createUpload(db(), context.caller, input),
  ),
  complete: anyone.files.complete.handler(({ input, context }) =>
    completeUpload(db(), context.caller, input.id),
  ),
  get: anyone.files.get.handler(({ input }) => getFile(db(), input.id)),
  list: anyone.files.list.handler(({ input }) => listFiles(db(), input.ids)),
  remove: anyone.files.remove.handler(({ input, context }) =>
    removeFile(db(), context.caller, context.actor, input.id),
  ),
  settings: authed.files.settings.handler(({ context }) => getFileSettings(db(), context.actor)),
  updateSettings: authed.files.updateSettings.handler(({ input, context }) =>
    updateFileSettings(db(), context.actor, input),
  ),
};
