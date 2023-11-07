import { IContext } from '../../connectionResolver';
import { Integrations } from '../../models';

const viberMutations: {
  viberIntegrationUpdate(_root: any, args: any, context: IContext);
} = {
  async viberIntegrationUpdate(_root, args, context: IContext): Promise<any> {
    const { inboxId, ...data } = args.update;
    const integration = await Integrations.findOneAndUpdate(
      { inboxId },
      { $set: { ...data } },
      {
        returnOriginal: false
      }
    );
    return integration;
  }
};

export default viberMutations;
