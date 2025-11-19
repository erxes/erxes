import { requireLogin } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import { ITicketSaveConfigArgs } from '~/modules/ticket/@types/ticketConfig';

export const ticketConfigMutations = {
  ticketSaveConfig: async (
    _parent: undefined,
    doc: ITicketSaveConfigArgs,
    { models, user }: IContext,
  ) => {
    const { input } = doc;
    const ticketConfig = await models.TicketConfig.findOne({
      pipelineId: input.pipelineId,
    });

    // Check for duplicate name
    const duplicateQuery: { [key: string]: any } = {
      name: input.name,
    };

    if (ticketConfig) {
      duplicateQuery._id = { $ne: ticketConfig._id };
    }

    const duplicateConfig = await models.TicketConfig.findOne(duplicateQuery);

    if (duplicateConfig) {
      throw new Error('Duplicated name');
    }

    if (ticketConfig) {
      return models.TicketConfig.findByIdAndUpdate(ticketConfig._id, input, {
        new: true,
      });
    }
    return models.TicketConfig.create({
      ...input,
      createdBy: user?._id,
      createAt: new Date(),
    });
  },
  ticketRemoveConfig: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    await models.TicketConfig.deleteOne({
      _id: _id,
    });
  },
};

// requireLogin(ticketConfigMutations, 'ticketSaveConfig');
// requireLogin(ticketConfigMutations, 'ticketRemoveConfig');
