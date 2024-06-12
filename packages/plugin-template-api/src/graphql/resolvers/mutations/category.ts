import { IContext } from "../../../connectionResolver"
import { TemplateCategoryDocument } from "../../../models/definitions/templates"

const categoryMutations = {
    categoryAdd: async (_root, doc: TemplateCategoryDocument, { user, models, subdomain }: IContext) => {
        const category = await models.TemplateCategories.createTemplateCategory(doc, user)

        return category
    },

    categoryEdit: async (_root, { _id, ...doc }: TemplateCategoryDocument, { user, models, subdomain }: IContext) => {
        const category = await models.TemplateCategories.updateTemplateCategory(_id, doc, user)

        return category
    },

    categoryRemove: async (_root, { _id }: { _id: string }, { user, models, subdomain }: IContext) => {
        const category = await models.TemplateCategories.removeTemplateCategory(_id)

        return category
    }
}

export default categoryMutations