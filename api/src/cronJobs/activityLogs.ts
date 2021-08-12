import * as dotenv from 'dotenv';
import * as schedule from 'node-schedule';
import { RABBITMQ_QUEUES } from '../data/constants';
import { ACTIVITY_LOG_ACTIONS, putActivityLog } from '../data/logUtils';
import { fetchSegment } from '../data/modules/segments/queryBuilder';
import { connect } from '../db/connection';
import {
  Companies,
  Customers,
  Deals,
  Segments,
  Tasks,
  Tickets
} from '../db/models';
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

    // const customers = await Customers.find({ _id: { $in: ids } }, { _id: 1 });
    // const customerIds = customers.map(c => c._id);

    // const companies = await Companies.find({ _id: { $in: ids } }, { _id: 1 });
    // const companyIds = companies.map(c => c._id);

    // const tickets = await Tickets.find({ _id: { $in: ids } }, { _id: 1 });
    // const ticketIds = tickets.map(c => c._id);

    let model: any = Customers;

    switch (segment.contentType) {
      case 'customer':
        model = Customers;
        break;

      case 'lead':
        model = Customers;
        break;

      case 'visitor':
        model = Customers;
        break;

      case 'company':
        model = Companies;
        break;

      case 'deal':
        model = Deals;
        break;

      case 'task':
        model = Tasks;
        break;

      case 'ticket':
        model = Tickets;
        break;

      default:
        break;
    }

    const result = await model.find({ _id: { $in: ids } }, { _id: 1 });
    const contentIds = result.map(c => c._id) || [];

    await putActivityLog({
      action: ACTIVITY_LOG_ACTIONS.CREATE_SEGMENT_LOG,
      data: { segment, contentIds, type: segment.contentType }
    });

    for (const contentId of contentIds) {
      messageBroker().sendMessage(RABBITMQ_QUEUES.AUTOMATIONS_TRIGGER, {
        type: segment.contentType,
        data: {
          segmentId: segment._id,
          conditions: segment.conditions
        },
        targetId: contentId
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
