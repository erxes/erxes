import { connect, disconnect } from '../db/connection';
import { Companies, Customers } from '../db/models';

export const customCommand = async () => {
  connect();

  const companies = await Companies.find({ name: { $exists: true } });
  // await Companies.collection.dropIndex('name_1');

  for (const company of companies) {
    await Companies.update(
      { _id: company._id },
      {
        $set: { names: [company.name], primaryName: company.name },
      },
    );
  }

  const customers = await Customers.find({
    $or: [{ email: { $exists: true } }, { phone: { $exists: true } }],
  });

  for (const customer of customers) {
    if (customer.email) {
      await Customers.update(
        { _id: customer._id },
        { $set: { primaryEmail: customer.email, emails: [customer.email] } },
      );
    }

    if (customer.phone) {
      await Customers.update(
        { _id: customer._id },
        { $set: { primaryPhone: customer.phone, phones: [customer.phone] } },
      );
    }
  }

  disconnect();
};

customCommand();
