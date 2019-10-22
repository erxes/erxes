import { connect } from '../db/connection';
import { Companies, Customers, Deals, GrowthHacks, Tasks, Tickets } from '../db/models';
import { fillSearchTextItem } from '../db/models/boardUtils';
import { ICustomer } from '../db/models/definitions/customers';

module.exports.up = async () => {
  await connect();

  const executer = async (objectType, converter) => {
    const entries = await objectType.find({});
    console.log(objectType.modelName, entries.length);

    for (const entry of entries) {
      const searchText = converter(entry);
      await objectType.updateOne({ _id: entry._id }, { $set: { searchText } });
    }
  };

  const fillSearchTextCustomer = (doc: ICustomer) => {
    return [
      doc.firstName || '',
      doc.lastName || '',
      doc.primaryEmail || '',
      doc.primaryPhone || '',
      (doc.emails || []).join(' '),
      (doc.phones || []).join(' '),
      doc.visitorContactInfo
        ? (doc.visitorContactInfo.email || '').concat(' ', doc.visitorContactInfo.phone || '')
        : '',
    ].join(' ');
  };

  await executer(Customers, fillSearchTextCustomer);

  await executer(Companies, Companies.fillSearchText);

  await executer(Deals, fillSearchTextItem);

  await executer(Tasks, fillSearchTextItem);

  await executer(Tickets, fillSearchTextItem);

  await executer(GrowthHacks, fillSearchTextItem);

  return Promise.resolve('ok');
};
