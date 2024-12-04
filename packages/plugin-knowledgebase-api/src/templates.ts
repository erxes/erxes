import { generateModels, IModels } from "./connectionResolver"
import { stringRandomId } from '@erxes/api-utils/src/mongoose-types'

const modelChanger = (type: string, models: IModels) => {
    if (type === 'categories') {
        return models.KnowledgeBaseCategories;
    }

    if (type === 'articles') {
        return models.KnowledgeBaseArticles;
    }

    return models.KnowledgeBaseTopics;
};

const generateUniqueCode = (baseCode: string) => {
    return `${baseCode}-${stringRandomId.default()}`;
};

export default {
    types: [
        {
            description: 'Knowledgebase',
            type: 'knowledgebase'
        }
    ],
    useTemplate: async ({ subdomain, data }) => {

        const { template, currentUser } = data

        const { content, relatedContents } = template

        const models = await generateModels(subdomain)

        const { _id, code, ...topicContent } = JSON.parse(content)

        let firstCategoryId: string = '';

        const topic = await models.KnowledgeBaseTopics.create({
            ...topicContent,
            code: generateUniqueCode(code),
            createdDate: new Date(),
            modifiedDate: new Date(),
            createdBy: currentUser._id,
            modifiedBy: currentUser._id
        })

        if ((relatedContents || []).length) {
            const idMapping = {};

            for (const relatedContent of relatedContents) {
                const { contentType: type, content } = relatedContent;
                const [_, contentType] = type.split(':');

                const model: any = modelChanger(contentType, models);

                const parsedRelatedContents = content.map(item => {
                    const { _id, topicId, code, parentCategoryId, categoryId, ...parsedContent } = JSON.parse(item);

                    const newId = stringRandomId.default();
                    idMapping[_id] = newId;

                    const parsedRelatedContent = {
                        ...parsedContent,
                        _id: newId,
                        topicId: topic._id,
                        code: generateUniqueCode(code),
                        createdDate: new Date(),
                        modifiedDate: new Date(),
                        createdBy: currentUser._id,
                        modifiedBy: currentUser._id
                    };

                    if (contentType === 'categories') {
                        parsedRelatedContent.parentCategoryId = idMapping[parentCategoryId]
                    }

                    if (contentType === 'articles') {
                        parsedRelatedContent.categoryId = idMapping[categoryId]

                        if (!firstCategoryId) {
                            firstCategoryId = idMapping[categoryId];
                        }
                    }

                    return parsedRelatedContent;
                });

                await model.insertMany(parsedRelatedContents);
            }
        }

        const reDirect = `/knowledgeBase?id=${firstCategoryId}`

        return { reDirect };
    },
    getRelatedContent: async ({ subdomain, data }) => {

        const models = await generateModels(subdomain)

        const { contentType: type, content: stringifiedContent } = data

        const [serviceName, contentType] = (type || '').split(':')

        const mainContent = JSON.parse(stringifiedContent)

        const relatedContents: any[] = []

        if (serviceName === 'knowledgebase') {

            const { _id: topicId } = mainContent

            if (contentType === 'topic') {

                const categories = await models.KnowledgeBaseCategories.find({ topicId }).lean()

                if (categories.length) {

                    relatedContents.push({
                        contentType: "knowledgebase:categories",
                        content: categories.map(category => JSON.stringify(category))
                    })

                    const articles = await models.KnowledgeBaseArticles.find({ topicId, categoryId: categories.map((c) => c._id) }).lean()

                    if (articles.length) {
                        relatedContents.push({
                            contentType: "knowledgebase:articles",
                            content: articles.map(article => JSON.stringify(article))
                        })
                    }

                }

            }
        }

        return relatedContents
    }
}