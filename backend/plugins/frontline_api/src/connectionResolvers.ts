import type { IModels } from '~/modelRegistrations/types';
import type { Connection } from 'mongoose';
import {
  createGenerateModels,
  type ScopedEventHandlers,
} from 'erxes-api-shared/utils';
import {
  registerResponseTemplateModel,
  registerInboxModels,
  registerMessengerModels,
} from '~/modelRegistrations/inbox';
import {
  registerTicketModels,
  registerSupportContentModels,
} from '~/modelRegistrations/support';
import {
  registerFacebookModels,
  registerFacebookBotModel,
} from '~/modelRegistrations/facebook';
import { registerInstagramModels } from '~/modelRegistrations/instagram';
import {
  registerCallModels,
  registerCallProModels,
} from '~/modelRegistrations/calls';
import {
  registerChatModels,
  registerMailModels,
} from '~/modelRegistrations/messaging';

export type { IModels, IContext } from '~/modelRegistrations/types';

export const loadClasses = (
  db: Connection,
  subdomain: string,
  eventHandlers: ScopedEventHandlers,
): IModels => {
  const models = {} as IModels;
  const frontlineEventHandlers = eventHandlers('frontline');
  registerResponseTemplateModel(db, models);
  registerTicketModels(db, models, frontlineEventHandlers);
  registerInboxModels(db, models, subdomain);
  registerFacebookModels(db, models, subdomain);
  registerInstagramModels(db, models, subdomain);
  registerCallModels(db, models);
  registerFacebookBotModel(db, models, subdomain);
  registerChatModels(db, models);
  registerCallProModels(db, models);
  registerMailModels(db, models);
  registerMessengerModels(db, models);
  registerSupportContentModels(db, models, subdomain);
  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
