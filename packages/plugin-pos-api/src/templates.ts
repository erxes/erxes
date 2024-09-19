import { generateModels, IModels } from "./connectionResolver"
import { stringRandomId } from '@erxes/api-utils/src/mongoose-types'

export default {
    types: [
        {
            description: 'Pos',
            type: 'pos'
        }
    ],
    useTemplate: async ({ subdomain, data }) => {

    },
    getRelatedContent: async ({ subdomain, data }) => { }
}