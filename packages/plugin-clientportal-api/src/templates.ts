import { generateModels, IModels } from "./connectionResolver"
import { stringRandomId } from '@erxes/api-utils/src/mongoose-types'

export default {
    types: [
        {
            description: 'Client Portal',
            type: 'client'
        },
        {
            description: 'Vendor Portal',
            type: 'vendor'
        }
    ],
    useTemplate: async ({ subdomain, data }) => {

    },
    getRelatedContent: async ({ subdomain, data }) => { }
}