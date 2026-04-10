import { msdynamicCheckMutations } from './checkDynamic';
import { msdynamicSyncMutations } from './syncDynamic';

export default { ...msdynamicCheckMutations, ...msdynamicSyncMutations }