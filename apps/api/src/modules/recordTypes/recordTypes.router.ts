import { db } from '@erxes/core-db';
import { listRecordTypes } from '~/modules/recordTypes/recordTypes.service';
import { scoped } from '~/orpc';

export const recordTypesRouter = {
  list: scoped.recordTypes.list.handler(async () => ({ data: await listRecordTypes(db()) })),
};
