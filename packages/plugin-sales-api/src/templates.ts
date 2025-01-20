import { generateModels, IModels } from "./connectionResolver";
import { stringRandomId } from '@erxes/api-utils/src/mongoose-types'

const modelChanger = (type: string, models: IModels) => {

    if (type === 'pipelines') {
        return models.Pipelines;
    }

    if (type === 'pipelineLabels') {
        return models.PipelineLabels;
    }

    if (type === 'stages') {
        return models.Stages;
    }

    return models.Boards;
};

export default {
    types: [
        {
            description: 'Deals',
            type: 'sales'
        }
    ],
    useTemplate: async ({ subdomain, data }) => {

        const { template, currentUser } = data

        const { content, contentType: mainType, relatedContents } = template

        const [_, mainContentType] = mainType.split(':');

        const models = await generateModels(subdomain)

        const { _id, code, pipelines, boardId, memberIds, ...parsedContent } = JSON.parse(content)

        let currentBoardId: string = ''
        let currentPipelineId: string = ''

        if (mainContentType === "pipelines") {

            const relatedBoard = relatedContents.find(relatedContent => {
                const { contentType: type } = relatedContent;
                const [_, contentType] = type.split(':');

                return contentType === "boards";
            })

            if (relatedBoard) {
                const { _id, ...boardContent } = JSON.parse(relatedBoard.content[0]);

                const board = await models.Boards.create({
                    ...boardContent,
                    userId: currentUser._id,
                    createdAt: new Date(),
                    type: 'deal',
                })

                if (board) {
                    currentBoardId = board._id

                    const pipeline = await models.Pipelines.create({
                        ...parsedContent,
                        userId: currentUser._id,
                        memberIds: memberIds?.length ? [currentUser._id] : [],
                        createdAt: new Date(),
                        boardId: board._id,
                        type: 'deal',
                    })

                    currentPipelineId = pipeline._id
                }
            }

        }

        if (mainContentType === "boards") {

            const board = await models.Boards.create({
                ...parsedContent,
                userId: currentUser._id,
                createdAt: new Date(),
                type: 'deal',
            })

            currentBoardId = board._id
        }

        if ((relatedContents || []).length) {
            const idMapping = {};

            for (const relatedContent of relatedContents) {
                const { contentType: type, content } = relatedContent;
                const [_, contentType] = type.split(':');

                const model: any = modelChanger(contentType, models);

                const parsedRelatedContents: any[] = [];

                if (contentType === 'boards' && currentBoardId) {
                    continue
                }

                for (const item of content) {
                    const { _id, boardId, pipelineId, ...parsedContent } = JSON.parse(item);

                    const newId = stringRandomId.default();
                    idMapping[_id] = newId;

                    const parsedRelatedContent: any = {
                        ...parsedContent,
                        _id: newId,
                        type: 'deal',
                        createdAt: new Date(),
                    };

                    if (contentType === 'pipelines') {
                        parsedRelatedContent.boardId = currentBoardId
                        parsedRelatedContent.userId = currentUser._id
                    }

                    if (contentType === 'stages') {
                        parsedRelatedContent.pipelineId = idMapping[pipelineId] || currentPipelineId
                    }

                    if (contentType === 'pipelineLabels') {
                        parsedRelatedContent.pipelineId = idMapping[pipelineId] || currentPipelineId
                        parsedRelatedContent.createdBy = currentUser._id
                    }

                    parsedRelatedContents.push(parsedRelatedContent);
                }

                if (parsedRelatedContents.length > 0) {
                    await model.insertMany(parsedRelatedContents);
                }
            }
        }

        const reDirect = `/settings/boards/deal?boardId=${currentBoardId}`

        return { reDirect };
    },
    getRelatedContent: async ({ subdomain, data }) => {

        const models = await generateModels(subdomain)

        const { contentType: type, content: stringifiedContent } = data

        const [serviceName, contentType] = (type || '').split(':')

        const mainContent = JSON.parse(stringifiedContent)

        const relatedContents: any[] = []

        if (serviceName === 'sales') {

            const { _id, boardId, pipelines } = mainContent

            let pipelineIds = [_id]

            if (contentType === 'pipelines') {

                const relatedBoard = await models.Boards.findOne({ _id: boardId }, { scopeBrandIds: 0, userId: 0, createdAt: 0 }).lean()

                if (relatedBoard) {

                    relatedContents.push({
                        contentType: "sales:boards",
                        content: JSON.stringify(relatedBoard)
                    })
                }

                const relatedStages = await models.Stages.find({ pipelineId: { $in: pipelineIds } }, { _id: 0, formId: 0, memberIds: 0, canEditMemberIds: 0, canMoveMemberIds: 0, departmentIds: 0, createdAt: 0 }).lean()

                if (relatedStages.length) {
                    relatedContents.push({
                        contentType: "sales:stages",
                        content: relatedStages.map(pipelineStage => JSON.stringify(pipelineStage))
                    })
                }

                const relatedPipelineLabels = await models.PipelineLabels.find({ pipelineId: { $in: pipelineIds } }, { _id: 0, createdBy: 0, createdAt: 0 }).lean()

                if (relatedPipelineLabels?.length) {
                    relatedContents.push({
                        contentType: "sales:pipelineLabels",
                        content: relatedPipelineLabels.map(pipelineLabel => JSON.stringify(pipelineLabel))
                    })
                }

            }

            if (contentType === 'boards') {

                pipelineIds = pipelines.map(pipeline => pipeline._id)

                const relatedPipelines = await models.Pipelines.find({ _id: { $in: pipelineIds } }, { scopeBrandIds: 0, userId: 0, watchedUserIds: 0, memberIds: 0, excludeCheckUserIds: 0, departmentIds: 0, createdAt: 0 }).lean()

                if (relatedPipelines.length) {

                    relatedContents.push({
                        contentType: "sales:pipelines",
                        content: relatedPipelines.map(category => JSON.stringify(category))
                    })

                    const relatedStages = await models.Stages.find({ pipelineId: { $in: pipelineIds } }, { _id: 0, formId: 0, memberIds: 0, canEditMemberIds: 0, canMoveMemberIds: 0, departmentIds: 0, createdAt: 0 }).lean()

                    if (relatedStages.length) {
                        relatedContents.push({
                            contentType: "sales:stages",
                            content: relatedStages.map(pipelineStage => JSON.stringify(pipelineStage))
                        })
                    }

                    const relatedPipelineLabels = await models.PipelineLabels.find({ pipelineId: { $in: pipelineIds } }, { _id: 0, createdBy: 0, createdAt: 0 }).lean()

                    if (relatedPipelineLabels.length) {
                        relatedContents.push({
                            contentType: "sales:pipelineLabels",
                            content: relatedPipelineLabels.map(pipelineLabel => JSON.stringify(pipelineLabel))
                        })
                    }

                }

            }


        }

        return relatedContents
    }
}