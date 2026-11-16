import { db } from '@erxes/core-db';
import { searchRecords } from '~/modules/search/search.service';
import { scoped } from '~/orpc';

export const searchRouter = {
  global: scoped.search.global.handler(({ input }) => searchRecords(db(), input)),
};
