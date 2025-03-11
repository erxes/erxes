import { sendCoreMessage } from './messageBroker';
import { getOrCreateCustomer, getOrCreateCdr } from './store';

const receiveCall = async (models, subdomain, params) => {
  const integration = await models.Integrations.findOne({
    $or: [
      { srcTrunk: params.src_trunk_name },
      { dstTrunk: params.dst_trunk_name },
    ],
  });
  if (!integration) throw new Error('Integration not found');

  const { userfield, dst, src, action_type, lastapp } = params;
  const primaryPhone =
    userfield === 'Outbound' && !action_type.includes('FOLLOWME') ? dst : src;

  const customer = await getOrCreateCustomer(models, subdomain, {
    primaryPhone,
    inboxIntegrationId: integration.inboxId,
  });

  let operator = null as any;

  if (lastapp === 'Queue') {
    let operatorId = userfield === 'Inbound' ? dst : src;
    const match = action_type?.match(/FOLLOWME\[(\d+)\]/);
    if (match) operatorId = match[1];

    const matchedOperator = integration.operators.find(
      ({ gsUsername }) => gsUsername === operatorId,
    );
    if (matchedOperator) {
      operator = await sendCoreMessage({
        subdomain,
        action: 'users.findOne',
        data: { _id: matchedOperator.userId },
        isRPC: true,
      });
    }
  }

  await getOrCreateCdr(
    models,
    subdomain,
    params,
    integration.inboxId,
    customer,
    operator?.details?.operatorPhone || '',
  );

  return 'success';
};

export default receiveCall;
