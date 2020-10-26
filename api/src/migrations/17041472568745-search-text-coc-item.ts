import { validSearchText } from '../data/utils';
import { connect } from '../db/connection';
import { Companies, Customers, Deals, GrowthHacks, Tasks, Tickets } from '../db/models';
import { fillSearchTextItem } from '../db/models/boardUtils';
import { ICustomer } from '../db/models/definitions/customers';

module.exports.up = async () => {
  await connect();

  const executer = async (objectType, converter, project) => {
    const entries = await objectType.aggregate([{ $project: project }]);
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
    return fillSearchTextItem({ stageId: '' }, item);
  };

  await executer(Customers, fillSearchTextCustomer, {
    _id: 1,
    firstName: 1,
    lastName: 1,
    emails: 1,
    phones: 1,
    visitorContactInfo: 1,
  });

  await executer(Companies, Companies.fillSearchText, {
    _id: 1,
    names: 1,
    emails: 1,
    phones: 1,
    website: 1,
    industry: 1,
    plan: 1,
    description: 1,
  });

  await executer(Deals, itemsFillSearchText, { _id: 1, name: 1, description: 1 });

  await executer(Tasks, itemsFillSearchText, { _id: 1, name: 1, description: 1 });

  await executer(Tickets, itemsFillSearchText, { _id: 1, name: 1, description: 1 });

  await executer(GrowthHacks, itemsFillSearchText, { _id: 1, name: 1, description: 1 });

  return Promise.resolve('ok');
};
