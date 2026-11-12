import { db } from '@erxes/core-db';
import {
  completeUpload,
  createUpload,
  getFile,
  getFileSettings,
  listFiles,
  removeFile,
  updateFileSettings,
} from '~/modules/files/files.service';
import { authed, anyone } from '~/orpc';

export const filesRouter = {
  createUpload: anyone.files.createUpload.handler(({ input, context }) =>
    createUpload(db(), context.caller, input),
  ),
  complete: anyone.files.complete.handler(({ input, context }) =>
    completeUpload(db(), context.caller, input.id),
  ),
  get: anyone.files.get.handler(({ input, context }) => getFile(db(), context.caller, input.id)),
  list: anyone.files.list.handler(({ input, context }) =>
    listFiles(db(), context.caller, input.ids),
  ),
  remove: anyone.files.remove.handler(({ input, context }) =>
    removeFile(db(), context.caller, context.actor, input.id),
  ),
  settings: authed.files.settings.handler(({ context }) => getFileSettings(db(), context.actor)),
  updateSettings: authed.files.updateSettings.handler(({ input, context }) =>
    updateFileSettings(db(), context.actor, input),
  ),
};
