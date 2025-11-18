import {
  createCoreModuleProducerHandler,
  TActivityLogProducers,
} from 'erxes-api-shared/core-modules';
import { TActivityLogConfigs } from 'erxes-api-shared/utils/logs/activityLogTypes';
import { generateModels } from '~/connectionResolvers';
import salesActivityLogHandlers from '~/modules/sales/meta/activityLogs/activityLogHandlers';

const modules = {
  sales: salesActivityLogHandlers,
};

export default {
  rules: [...salesActivityLogHandlers.rules],
  activityGetter: createCoreModuleProducerHandler({
    moduleName: 'activityLog',
    modules,
    methodName: TActivityLogProducers.ACTIVITY_GETTER,
    extractModuleName: (input) => input.moduleName,
    generateModels,
  }),
} as TActivityLogConfigs;
