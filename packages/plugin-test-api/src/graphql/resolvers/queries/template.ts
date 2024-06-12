import { paginate } from "@erxes/api-utils/src";
import { IContext } from "../../../connectionResolver";
import { sendCommonMessage } from "../../../messageBroker";

interface IListParams {
    page: number;
    perPage: number;
    searchValue: string;
    categoryIds: string[];
    contentType: string;
}

const generateFilter = async (args: IListParams) => {
    const { searchValue, categoryIds, contentType } = args;

    let filter: any = {}

    if (searchValue) {
        filter.name = new RegExp(`.*${searchValue}.*`, 'i');
    }

    if (categoryIds?.length) {
        filter.categoryIds = { $in: categoryIds }
    }

    if (contentType) {
        filter.contentType = contentType
    }

    return filter
}

const templateQueries = {
    templateList: async (_root, args: IListParams, { models }: IContext) => {
        const filter = await generateFilter(args)

        const list = await paginate(models.Templates.find(filter).sort({ createdAt: 1 }), args)
        const totalCount = await models.Templates.find(filter).countDocuments()

        return { list, totalCount }
    },

    templateDetail: async (_root, { _id }: { _id: string }, { models }: IContext) => {
        const template = await models.Templates.getTemplate(_id);

        return template
    },

    // templatePreview: async (_root, { serviceName, contentType, contentId }, { subdomain }: IContext) => {
    //     const template = await sendCommonMessage({
    //         subdomain,
    //         serviceName,
    //         action: 'templates.getTemplate',
    //         data: {
    //             contentId,
    //             contentType,
    //         },
    //         isRPC: true,
    //     })

    //     const parsedTemplate = JSON.parse(template)

    //     return parsedTemplate
    // }
}

export default templateQueries