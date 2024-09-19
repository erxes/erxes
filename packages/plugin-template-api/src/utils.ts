import { sendCommonMessage } from "./messageBroker"

export const getRelatedContents = async (data: any, subdomain: any) => {

    const { contentType } = data

    const [serviceName, _] = (contentType || '').split(':')

    const relatedContents = await sendCommonMessage({
        subdomain,
        serviceName,
        action: 'templates.getRelatedContent',
        data,
        isRPC: true,
        defaultValue: []
    });

    return relatedContents
}