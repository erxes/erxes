import { createGenerateModels } from 'erxes-api-shared/utils';
import { IModels, loadClasses } from './modules/storage/db/models/Storage';

export const generateModels = createGenerateModels<IModels>(loadClasses);
