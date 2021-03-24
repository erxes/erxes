import * as dotenv from 'dotenv';
import { connect } from '../db/connection';
import {
  ActivityLogs,
  Companies,
  Conformities,
  InternalNotes
} from '../db/models';

dotenv.config();

const command = async () => {
  await connect();

  const companies = await Companies.find(
    { primaryName: null, $or: [{ names: [] }, { names: null }] },
    { _id: 1 }
  );
  const companyIds = companies.map(c => c._id);
  console.log(companyIds.length);

  await ActivityLogs.deleteMany({
    contentType: 'company',
    contentTypeId: { $in: companyIds }
  });

  await InternalNotes.deleteMany({
    contentType: 'company',
    contentTypeId: { $in: companyIds }
  });

  await Conformities.deleteMany({
    $or: [
      { mainType: 'company', mainTypeId: { $in: companyIds } },
      { relType: 'company', relTypeId: { $in: companyIds } }
    ]
  });

  await Companies.deleteMany({
    primaryName: null,
    $or: [{ names: [] }, { names: null }]
  });

  process.exit();
};

command();
