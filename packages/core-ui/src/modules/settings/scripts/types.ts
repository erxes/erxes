import { IIntegration } from '@erxes/ui-settings/src/integrations/types';

export interface IScript {
  _id: string;
  name: string;
  messengerId?: string;
  leadIds?: string[];
  leads?: IIntegration[];
  kbTopicId?: string;
}
