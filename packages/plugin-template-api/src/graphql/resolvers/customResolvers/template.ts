import { IContext } from "../../../connectionResolver";
import { TemplateDocument } from "../../../models/definitions/templates";

const templateResolvers = {

    categories: async (template: TemplateDocument, _, { models }: IContext) => {
        try {
            const { categoryIds } = template

            return models.TemplateCategories.find({ _id: { $in: categoryIds } })

        } catch (error) {
            return new Error(`Invalid ${error.path}: ${error.value}`)
        }
    },
    createdBy: async (template: TemplateDocument) => {
        return (
            template.createdBy && {
                __typename: 'User',
                _id: template.createdBy,
            }
        );
    },
    updatedBy: async (template: TemplateDocument) => {
        return (
            template.updatedBy && {
                __typename: 'User',
                _id: template.updatedBy,
            }
        );
    },
}

export default templateResolvers;