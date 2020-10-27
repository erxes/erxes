import * as _ from 'underscore';
import { moduleCheckPermission } from '../../permissions/wrappers';
import { IContext } from '../../types';

interface IEvent {
  title?: string;
  description?: string;
  start: string;
  end: string;
}

const calendarMutations = {
  /**
   * Create a new channel and send notifications to its members bar the creator
   */
  async createCalendarEvent(_root, doc: IEvent, { dataSources }: IContext) {
    return dataSources.IntegrationsAPI.createCalendarEvent(doc);
  },
};

moduleCheckPermission(calendarMutations, 'manageChannels');

export default calendarMutations;
