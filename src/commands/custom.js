import { connect, disconnect } from '../db/connection';
import { Companies, Deals } from '../db/models';

export const customCommand = async () => {
  connect();

  const companies = await Companies.find({ website: { $exists: true } });

  for (const company of companies) {
    await Companies.update({ _id: company._id }, { $set: { links: { website: company.website } } });
  }

  await Deals.updateMany({ name: { $exists: false } }, { $set: { name: 'Deal name' } });

  disconnect();
};

customCommand();
