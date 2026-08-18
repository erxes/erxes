import { IContext } from '~/connectionResolvers';
import { ITicketSaveConfigArgs } from '~/modules/ticket/@types/ticketConfig';
import { validateTicketPropertyFields } from '@/ticket/utils/ticketConfig';

export const ticketConfigMutations = {
  ticketSaveConfig: async (
    _parent: undefined,
    doc: ITicketSaveConfigArgs,
    { models, subdomain, user }: IContext,
  ) => {
    const { input } = doc;

    const propertyFields = await validateTicketPropertyFields(
      subdomain,
      input.propertyFields,
    );

    const ticketConfig = await models.TicketConfig.findOne({
      pipelineId: input.pipelineId,
    });

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
      return models.TicketConfig.findByIdAndUpdate(
        ticketConfig._id,
        { ...input, propertyFields },
        { new: true },
      );
    }
    return models.TicketConfig.create({
      ...input,
      propertyFields,
      createdBy: user?._id,
      createAt: new Date(),
    });
  },
  ticketRemoveConfig: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    const ticketConfig = await models.TicketConfig.getTicketConfig(_id);

    await models.TicketConfig.deleteOne({
      _id: _id,
    });

    await models.Integrations.updateMany(
      { ticketConfigIds: _id },
      { $pull: { ticketConfigIds: _id } },
    );

    return ticketConfig;
  },
};
