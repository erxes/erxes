import { markResolvers } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { widgetMutations } from './widget';

export const cpInboxMutations = {
  async cpConnect(_root, args: any, ctx: IContext, info: any) {
    return widgetMutations.widgetsMessengerConnect(_root, args, ctx, info);
  },

  async cpInsertMessage(_root, args: any, ctx: IContext, info: any) {
    return widgetMutations.widgetsInsertMessage(_root, args, ctx, info);
  },
};

markResolvers(cpInboxMutations, {
  wrapperConfig: {
    forClientPortal: true,
  },
});
