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
    console.log('start migration on customerCompany conformity');

    const executer = (mainType, relType, fieldName, entries) => {
      const modifier: any[] = [];

      for (const entry of entries) {
        for (const subEntryId of entry.toObject()[fieldName]) {
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
      await Customers.find({ companyIds: { $exists: true }, $where: 'this.companyIds.length>1' }),
    );

    await executer(
      'deal',
      'customer',
      'customerIds',
      await Deals.find({ customerIds: { $exists: true }, $where: 'this.customerIds.length>1' }),
    );
    await executer(
      'deal',
      'company',
      'companyIds',
      await Deals.find({ companyIds: { $exists: true }, $where: 'this.companyIds.length>1' }),
    );

    await executer(
      'ticket',
      'customer',
      'customerIds',
      await Tickets.find({ customerIds: { $exists: true }, $where: 'this.customerIds.length>1' }),
    );
    await executer(
      'ticket',
      'company',
      'companyIds',
      await Tickets.find({ companyIds: { $exists: true }, $where: 'this.companyIds.length>1' }),
    );

    await executer(
      'task',
      'customer',
      'customerIds',
      await Tasks.find({ customerIds: { $exists: true }, $where: 'this.customerIds.length>1' }),
    );
    await executer(
      'task',
      'company',
      'companyIds',
      await Tasks.find({ companyIds: { $exists: true }, $where: 'this.companyIds.length>1' }),
    );
  } catch (e) {
    console.log('conformity migration ', e.message);
  }

  return Promise.resolve('ok');
};
