import { connect, disconnect } from '../db/connection';
import { Companies } from '../db/models';

export const customCommand = async () => {
  connect();

  const companies = await Companies.find({ name: { $exists: true } });
  await Companies.collection.dropIndex('name_1');

  for (const company of companies) {
    await Companies.update(
      { _id: company._id },
      {
        $set: { names: [company.name], primaryName: company.name },
      },
    );
  }

  disconnect();
};

customCommand();
