import { IContext } from "../../../connectionResolver";
import { getService, getServices } from "@erxes/api-utils/src/serviceDiscovery";

interface IListParams {
    type: string
}

const generateFilter = (args: IListParams) => {
    const { type } = args;

    let filter: any = {}

    if (type) {
        filter.contentType = type
    }

    return filter
}

const categoryQueries = {
    categoryList: async (_root, args: IListParams, { models }: IContext) => {
        const filter = await generateFilter(args)

        const list = await models.TemplateCategories.find(filter).sort({ createdAt: 1 })
        const totalCount = await models.TemplateCategories.find(filter).countDocuments()

        return { list, totalCount }
    },

    templatesGetTypes: async () => {
        const services = await getServices();
        const fieldTypes: Array<{ description: string; type: string }> = [];

        for (const serviceName of services) {
            const service = await getService(serviceName);
            const meta = service.config.meta || {};
            if (meta?.templates) {
                const types = meta.templates.types || [];

                for (const type of types) {
                    fieldTypes.push({
                        description: type.description,
                        type: `${serviceName}:${type.type}`,
                    });
                }
            }
        }

        return fieldTypes;
    }
}

export default categoryQueries