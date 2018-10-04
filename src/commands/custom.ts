import { connect, disconnect } from '../db/connection';
import { Companies, Customers } from '../db/models';

export const customCommand = async () => {
  connect();

  const companies = await Companies.find({
    $or: [{ email: { $exists: true } }, { phone: { $exists: true } }],
  });

  for (const company of companies) {
    const { phone, email } = company;

    if (phone) {
      await Companies.update({ _id: company._id }, { $set: { primaryPhone: phone, phones: [phone] } });
    }

    if (email) {
      await Companies.update({ _id: company._id }, { $set: { primaryEmail: email, emails: [email] } });
    }
  }

  const customers = await Customers.find({
    primaryPhone: { $regex: /^-/i },
  });

  for (const customer of customers) {
    if (!customer.primaryPhone) {
      return;
    }

    const updatedPhone = customer.primaryPhone.substr(1);

    await Customers.update({ _id: customer._id }, { $set: { primaryPhone: updatedPhone } });
    await Customers.update({ _id: customer._id }, { $pull: { phones: customer.primaryPhone } });
    await Customers.update({ _id: customer._id }, { $push: { phones: updatedPhone } });
  }

  disconnect();
};

customCommand();
