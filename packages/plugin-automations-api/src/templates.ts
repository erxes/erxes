import { generateModels } from "./connectionResolver"

export default {
    types: [
        {
            description: 'Automations',
            type: 'automations'
        }
    ],
    useTemplate: async ({ subdomain, data }) => {

        const { template, currentUser } = data

        const { name, content } = template

        const models = await generateModels(subdomain)

        const parsedContent = JSON.parse(content)

        const automation = await models.Automations.create({
            ...parsedContent,
            name,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: currentUser._id,
            updatedBy: currentUser._id
        });

        const reDirect = `/automations/details/${automation._id}`

        return { reDirect };
    },
    getRelatedContent: async () => { }
}