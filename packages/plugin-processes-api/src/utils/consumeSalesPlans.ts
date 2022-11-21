import { generateModels } from '../connectionResolver';
import { sendSalesplansMessage } from '../messageBroker';

const sendStatus = async (subdomain, _ids: string[], status: string) => {
  await sendSalesplansMessage({
    subdomain,
    action: 'dayPlans.updateStatus',
    data: { _ids, status }
  });
};

export const consumeSalesPlans = async (
  subdomain,
  { dayPlans, date, branchId, departmentId }
) => {
  const models = await generateModels(subdomain);
  const dayPlanIds = dayPlans.map(d => d._id);

  await sendStatus(subdomain, dayPlanIds, 'confirmed');
  return {};
};
