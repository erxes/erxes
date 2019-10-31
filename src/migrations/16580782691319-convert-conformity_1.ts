import { connect } from '../db/connection';
import { Conformities, Customers, Deals, Tasks, Tickets } from '../db/models';

/**
 * Rename coc field to contentType
 *
 */
module.exports.up = async () => {
  await connect();

  console.log('start migration on convert conformity');
  try {
    const executer = async (mainType, relType, fieldName, entries) => {
      console.log('start migration', mainType, '-', relType, ' on conformity');

      const modifier: any[] = [];

      for (const entry of entries) {
        for (const subEntryId of entry[fieldName]) {
          modifier.push({
            mainType,
            mainTypeId: entry._id,
            relType,
            relTypeId: subEntryId,
          });
        }
      }

      return Conformities.insertMany(modifier);
    };

    await executer(
      'customer',
      'company',
      'companyIds',
      await Customers.aggregate([
        {
          $project: {
            _id: 1,
            companyIds: 1,
            idsLength: { $cond: { if: { $isArray: '$companyIds' }, then: { $size: '$companyIds' }, else: 0 } },
          },
        },
        { $match: { companyIds: { $exists: true }, idsLength: { $gt: 0 } } },
      ]),
    );

    await executer(
      'deal',
      'customer',
      'customerIds',
      await Deals.aggregate([
        {
          $project: {
            _id: 1,
            customerIds: 1,
            idsLength: { $cond: { if: { $isArray: '$customerIds' }, then: { $size: '$customerIds' }, else: 0 } },
          },
        },
        { $match: { customerIds: { $exists: true }, idsLength: { $gt: 0 } } },
      ]),
    );
    await executer(
      'deal',
      'company',
      'companyIds',
      await Deals.aggregate([
        {
          $project: {
            _id: 1,
            companyIds: 1,
            idsLength: { $cond: { if: { $isArray: '$companyIds' }, then: { $size: '$companyIds' }, else: 0 } },
          },
        },
        { $match: { companyIds: { $exists: true }, idsLength: { $gt: 0 } } },
      ]),
    );

    await executer(
      'ticket',
      'customer',
      'customerIds',
      await Tickets.aggregate([
        {
          $project: {
            _id: 1,
            customerIds: 1,
            idsLength: { $cond: { if: { $isArray: '$customerIds' }, then: { $size: '$customerIds' }, else: 0 } },
          },
        },
        { $match: { customerIds: { $exists: true }, idsLength: { $gt: 0 } } },
      ]),
    );
    await executer(
      'ticket',
      'company',
      'companyIds',
      await Tickets.aggregate([
        {
          $project: {
            _id: 1,
            companyIds: 1,
            idsLength: { $cond: { if: { $isArray: '$companyIds' }, then: { $size: '$companyIds' }, else: 0 } },
          },
        },
        { $match: { companyIds: { $exists: true }, idsLength: { $gt: 0 } } },
      ]),
    );

    await executer(
      'task',
      'customer',
      'customerIds',
      await Tasks.aggregate([
        {
          $project: {
            _id: 1,
            customerIds: 1,
            idsLength: { $cond: { if: { $isArray: '$customerIds' }, then: { $size: '$customerIds' }, else: 0 } },
          },
        },
        { $match: { customerIds: { $exists: true }, idsLength: { $gt: 0 } } },
      ]),
    );
    await executer(
      'task',
      'company',
      'companyIds',
      await Tasks.aggregate([
        {
          $project: {
            _id: 1,
            companyIds: 1,
            idsLength: { $cond: { if: { $isArray: '$companyIds' }, then: { $size: '$companyIds' }, else: 0 } },
          },
        },
        { $match: { companyIds: { $exists: true }, idsLength: { $gt: 0 } } },
      ]),
    );
  } catch (e) {
    console.log('conformity migration ', e.message);
  }

  return Promise.resolve('ok');
};
