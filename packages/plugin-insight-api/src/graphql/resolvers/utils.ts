import { sendCommonMessage } from '../../messageBroker';

export const chartGetResult = async (
    { serviceName, templateType, chartType, filter: stringifiedFilter },
    subdomain: any,
) => {
    const filter = JSON.parse(stringifiedFilter)

    const chartResult = await sendCommonMessage({
        subdomain,
        serviceName,
        action: 'reports.getChartResult',
        data: {
            filter,
            templateType,
            chartType
        },
        isRPC: true,
    });

    return chartResult;
};
