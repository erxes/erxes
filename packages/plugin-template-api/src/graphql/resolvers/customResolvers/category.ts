import { IContext } from "../../../connectionResolver";
import { TemplateCategoryDocument } from "../../../models/definitions/templates";

const categoryResolvers = {
    templateCount: async (category: TemplateCategoryDocument, _, { models }: IContext) => {
        try {
            const { _id } = category;

            return await models.Templates.find({ categoryIds: { $in: [_id] } }).countDocuments()

        } catch (error) {
            return new Error(`Invalid ${error.path}: ${error.value}`);
        }
    },
    isRoot: async (category: TemplateCategoryDocument) => {
        return !category.parentId;
    },
    createdBy: async (category: TemplateCategoryDocument) => {
        return (
            category.createdBy && {
                __typename: 'User',
                _id: category.createdBy,
            }
        );
    },
    updatedBy: async (category: TemplateCategoryDocument) => {
        return (
            category.updatedBy && {
                __typename: 'User',
                _id: category.updatedBy,
            }
        );
    },
}

export default categoryResolvers