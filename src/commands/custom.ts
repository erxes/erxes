import { connect, disconnect } from '../db/connection';
import { Companies } from '../db/models';

export const customCommand = async () => {
  connect();

  const companies = await Companies.find({
    $or: [{ email: { $exists: true } }, { phone: { $exists: true } }],
  });

  console.log(companies.length);

  for (const company of companies) {
    const { phone, email } = company;

    if (phone) {
      await Companies.update({ _id: company._id }, { $set: { primaryPhone: phone, phones: [phone] } });
    }

    if (email) {
      await Companies.update({ _id: company._id }, { $set: { primaryEmail: email, emails: [email] } });
    }
  }

  disconnect();
};

customCommand();
