import { IContext } from "../../../connectionResolver";
import { sendCommonMessage } from "../../../messageBroker";
import { TemplateDocument } from "../../../models/definitions/templates";

const templateMutations = {
    templateAdd: async (_root, doc: TemplateDocument, { user, models, subdomain }: IContext) => {
        const template = await models.Templates.createTemplate(doc, subdomain, user)

        return template
    },

    templateEdit: async (_root, { _id, ...doc }: TemplateDocument, { user, models, subdomain }: IContext) => {
        const template = await models.Templates.updateTemplate(_id, doc, user)

        return template
    },

    templateRemove: async (_root, { _id }: { _id: string }, { user, models, subdomain }: IContext) => {
        const template = await models.Templates.removeTemplate(_id)

        return template
    },

    templateUse: async (_root, { serviceName, contentType, template }, { user, subdomain }: IContext) => {

        const response = await sendCommonMessage({
            subdomain,
            serviceName,
            action: 'templates.useTemplate',
            data: {
                template,
                contentType,
                currentUser: user
            },
            isRPC: true,
        })

        return response
    }
}

export default templateMutations;