import * as dotenv from 'dotenv';
import { connect } from '../db/connection';
import { Companies, Conformities, Customers } from '../db/models';

dotenv.config();

const command = async () => {
  console.log(`Process started at: ${new Date()}`);

  await connect();

  const companies = await Companies.find({
    scopeBrandIds: { $exists: true, $size: 0 }
  });
  const companyIds = companies.map(e => e._id);
  const conformities = await Conformities.find({
    mainTypeId: { $in: companyIds },
    relType: 'customer'
  });

  for (const conformity of conformities) {
    const customer = await Customers.getCustomer(conformity.relTypeId);

    await Companies.update(
      { _id: conformity.mainTypeId },
      { $set: { scopeBrandIds: customer.scopeBrandIds } }
    );
  }
};

command().then(() => {
  console.log(`Process finished at: ${new Date()}`);
  process.exit();
});
