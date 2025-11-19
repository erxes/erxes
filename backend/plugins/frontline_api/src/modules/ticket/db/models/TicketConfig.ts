import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

import { ITicketConfigDocument } from '../../@types/ticketConfig';
import { TicketConfigSchema } from '../definitions/ticketConfig';

export interface ITicketConfigModel extends Model<ITicketConfigDocument> {
  getTicketConfig(_id: string): Promise<ITicketConfigDocument>;
}

export const loadTicketConfigClass = (models: IModels) => {
  class TicketConfig {
    public static async getTicket(_id: string): Promise<ITicketConfigDocument> {
      const ticketConfig = await models.TicketConfig.findOne({ _id });
      if (!ticketConfig) throw new Error('Ticket not found');
      return ticketConfig;
    }
  }

  TicketConfigSchema.loadClass(TicketConfig);

  return TicketConfigSchema;
};
