import * as dotenv from 'dotenv';
import * as schedule from 'node-schedule';
import { RABBITMQ_QUEUES } from '../data/constants';
import { ACTIVITY_LOG_ACTIONS, putActivityLog } from '../data/logUtils';
import { fetchSegment } from '../data/modules/segments/queryBuilder';
import { connect } from '../db/connection';
import { Companies, Customers, Segments, Tickets } from '../db/models';
import messageBroker from '../messageBroker';

/**
 * Send conversation messages to customer
 */
dotenv.config();

export const createActivityLogsFromSegments = async () => {
  await connect();
  const segments = await Segments.find({});

  for (const segment of segments) {
    const ids = await fetchSegment(segment);

    const associatedCustomers = await fetchSegment(segment, {
      associatedCustomers: true
    });

    const customers = await Customers.find({ _id: { $in: ids } }, { _id: 1 });
    const customerIds = customers.map(c => c._id);

    const companies = await Companies.find({ _id: { $in: ids } }, { _id: 1 });
    const companyIds = companies.map(c => c._id);

    const tickets = await Tickets.find({ _id: { $in: ids } }, { _id: 1 });
    const ticketIds = tickets.map(c => c._id);

    await putActivityLog({
      action: ACTIVITY_LOG_ACTIONS.CREATE_SEGMENT_LOG,
      data: { segment, contentIds: customerIds, type: 'customer' }
    });

    await putActivityLog({
      action: ACTIVITY_LOG_ACTIONS.CREATE_SEGMENT_LOG,
      data: { segment, contentIds: companyIds, type: 'company' }
    });

    await putActivityLog({
      action: ACTIVITY_LOG_ACTIONS.CREATE_SEGMENT_LOG,
      data: { segment, contentIds: ticketIds, type: 'ticket' }
    });

    if (associatedCustomers.length > 0) {
      messageBroker().sendMessage(RABBITMQ_QUEUES.AUTOMATIONS_TRIGGER, {
        mainType: segment.contentType,
        type: 'customer',
        data: associatedCustomers,
        targetId: segment.id
      });
    }
  }
};

/**
 * *    *    *    *    *    *
 * ┬    ┬    ┬    ┬    ┬    ┬
 * │    │    │    │    │    |
 * │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
 * │    │    │    │    └───── month (1 - 12)
 * │    │    │    └────────── day of month (1 - 31)
 * │    │    └─────────────── hour (0 - 23)
 * │    └──────────────────── minute (0 - 59)
 * └───────────────────────── second (0 - 59, OPTIONAL)
 */
schedule.scheduleJob('*/1 * * * *', () => {
  createActivityLogsFromSegments();
});
