import { sendCommonMessage } from '../../messageBroker';

export const reportChartGetResult = async (
  { serviceName, templateType, filter },
  subdomain: any,
) => {
  const reportResult = await sendCommonMessage({
    subdomain,
    serviceName,
    action: 'reports.getChartResult',
    data: {
      filter,
      templateType,
    },
    isRPC: true,
  });

  return reportResult;
};
