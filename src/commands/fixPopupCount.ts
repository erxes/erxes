import * as dotenv from 'dotenv';
import { connect } from '../db/connection';
import { FormSubmissions, Integrations } from '../db/models';
import { ILeadData } from '../db/models/definitions/integrations';

dotenv.config();

const command = async () => {
  await connect();

  const integrations = await Integrations.find({ kind: 'lead' });

  for (const integration of integrations) {
    const leadData: ILeadData = integration.leadData || {};

    leadData.contactsGathered = await FormSubmissions.find({ formId: integration.formId }).countDocuments();
    leadData.viewCount = leadData.contactsGathered * 2;

    await Integrations.updateOne({ _id: integration._id }, { $set: { leadData } });
  }

  process.exit();
};

command();
