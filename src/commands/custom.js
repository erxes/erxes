import { connect, disconnect } from '../db/connection';
import { Companies, Customers } from '../db/models';

export const customCommand = async () => {
  connect();

  const companies = await Companies.find({
    name: { $exists: true },
    primaryName: { $exists: false },
  });

  try {
    Companies.dropIndex({ name: 1 });
  } catch (e) {
    console.log(e);
  }

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

  try {
    Customers.dropIndex({ email: 1 });
  } catch (e) {
    console.log(e);
  }

  for (const customer of customers) {
    if (customer.email && !customer.primaryEmail) {
      await Customers.update(
        { _id: customer._id },
        { $set: { primaryEmail: customer.email, emails: [customer.email] } },
      );
    }

    if (customer.phone && !customer.primaryPhone) {
      await Customers.update(
        { _id: customer._id },
        { $set: { primaryPhone: customer.phone, phones: [customer.phone] } },
      );
    }
  }

  disconnect();
};

customCommand();
