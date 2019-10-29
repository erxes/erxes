import { validSearchText } from '../data/utils';
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
    return validSearchText([
      doc.firstName || '',
      doc.lastName || '',
      (doc.emails || []).join(' '),
      (doc.phones || []).join(' '),
      doc.visitorContactInfo
        ? (doc.visitorContactInfo.email || '').concat(' ', doc.visitorContactInfo.phone || '')
        : '',
    ]);
  };

  const itemsFillSearchText = (item: any) => {
    return fillSearchTextItem({}, item);
  };

  await executer(Customers, fillSearchTextCustomer);

  await executer(Companies, Companies.fillSearchText);

  await executer(Deals, itemsFillSearchText);

  await executer(Tasks, itemsFillSearchText);

  await executer(Tickets, itemsFillSearchText);

  await executer(GrowthHacks, itemsFillSearchText);

  return Promise.resolve('ok');
};
