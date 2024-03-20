import { sendCommonMessage } from '../../messageBroker';

export const chartGetResult = async (
    { serviceName, templateType, filter },
    subdomain: any,
) => {
    const chartResult = await sendCommonMessage({
        subdomain,
        serviceName,
        action: 'reports.getChartResult',
        data: {
            filter,
            templateType,
        },
        isRPC: true,
    });

    return chartResult;
};
