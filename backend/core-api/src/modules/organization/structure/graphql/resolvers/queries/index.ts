import { branchsQueries } from './branches';
import { positionQueries } from './positions';
import { structuresQueries } from './structure';
import { deparmentQueries } from './deparments';
import { unitsQueries } from './units';
export const structureQueries = {
  ...branchsQueries,
  ...positionQueries,
  ...structuresQueries,
  ...deparmentQueries,
  ...unitsQueries
};
