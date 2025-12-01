import { initTRPC } from '@trpc/server';
import { ITRPCContext, sendTRPCMessage } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { IModels } from '~/connectionResolvers';

export type SalesTRPCContext = ITRPCContext<{ models: IModels }>;

const t = initTRPC.context<SalesTRPCContext>().create();

export const templateTrpcRouter = t.router({
  templates: {
    saveAsTemplate: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        const { sourceId, contentType, name, description } = input;

        try {
          if (contentType === 'sales:board') {
            // Get board and all pipelines
            const board = await models.Boards.getBoard(sourceId);
            const pipelines = await models.Pipelines.find({
              boardId: sourceId,
            }).lean();

            const pipelinesWithStages = await Promise.all(
              pipelines.map(async (pipeline: any) => {
                const stages = await models.Stages.find({
                  pipelineId: pipeline._id,
                }).lean();

                return {
                  ...pipeline,
                  stages,
                };
              }),
            );

            // Prepare template content
            const templateContent = {
              board: {
                name: board.name,
                userId: board.userId,
                order: board.order,
              },
              pipelines: pipelinesWithStages.map((pipeline) => {
                const {
                  _id,
                  boardId,
                  createdAt,
                  updatedAt,
                  __v,
                  stages,
                  ...pipelineData
                } = pipeline as Record<string, unknown>;

                return {
                  ...pipelineData,
                  stages: (stages as Array<Record<string, unknown>>).map(
                    (stage) => {
                      const {
                        _id: stageId,
                        pipelineId,
                        createdAt: stageCreatedAt,
                        updatedAt: stageUpdatedAt,
                        __v: stageV,
                        itemsTotalCount,
                        unUsedAmount,
                        amount,
                        ...stageData
                      } = stage;

                      return stageData;
                    },
                  ),
                };
              }),
            };

            return {
              status: 'success',
              data: {
                content: JSON.stringify(templateContent),
                description:
                  description || `Template created from board: ${board.name}`,
              },
            };
          }

          if (contentType === 'sales:pipeline') {
            // Get pipeline and board info
            const pipeline = await models.Pipelines.getPipeline(sourceId);
            const board = await models.Boards.getBoard(pipeline.boardId);
            const stages = await models.Stages.find({
              pipelineId: sourceId,
            }).lean();

            const pipelineLean = pipeline.toObject
              ? pipeline.toObject()
              : { ...pipeline };
            const {
              _id: pId,
              boardId,
              createdAt,
              updatedAt,
              __v,
              ...pipelineData
            } = pipelineLean as Record<string, unknown>;

            const templateContent = {
              board: {
                name: board.name,
                userId: board.userId,
                order: board.order,
              },
              pipeline: {
                ...pipelineData,
                stages: stages.map((stage) => {
                  const {
                    _id: stageId,
                    pipelineId,
                    createdAt: stageCreatedAt,
                    updatedAt: stageUpdatedAt,
                    __v: stageV,
                    itemsTotalCount,
                    unUsedAmount,
                    amount,
                    ...stageData
                  } = stage as Record<string, unknown>;

                  return stageData;
                }),
              },
            };

            return {
              status: 'success',
              data: {
                content: JSON.stringify(templateContent),
                description:
                  description ||
                  `Template created from pipeline: ${pipeline.name}`,
              },
            };
          }

          return {
            status: 'error',
            errorMessage: `Unsupported content type: ${contentType}`,
          };
        } catch (error) {
          return {
            status: 'error',
            errorMessage: error.message || 'Failed to collect template data',
          };
        }
      }),

    useTemplate: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
      const { models } = ctx;
      const { template, contentType, currentUser } = input;

      try {
        const content = JSON.parse(template.content);

        if (contentType === 'sales:board') {
          const { board: boardData, pipelines: pipelinesData } = content;

          // Create board
          const newBoard = await models.Boards.createBoard({
            name: boardData.name || 'Untitled Board (from template)',
            userId: currentUser._id,
            order: boardData.order,
          });

          // Create pipelines with stages
          for (const pipelineData of pipelinesData || []) {
            const { stages, ...pipelineFields } = pipelineData;

            // Clean stages data and add required fields
            const cleanStages = (stages || []).map((stageData: any) => {
              const {
                itemsTotalCount,
                unUsedAmount,
                amount,
                ...cleanStageData
              } = stageData;
              return {
                ...cleanStageData,
                probability: cleanStageData.probability || '10%',
                type: cleanStageData.type || 'deal',
              };
            });

            await models.Pipelines.createPipeline(
              {
                ...pipelineFields,
                boardId: newBoard._id,
                userId: currentUser._id,
                type: pipelineFields.type || 'deal',
              },
              cleanStages,
            );
          }

          return {
            status: 'success',
            boardId: newBoard._id,
            message: 'Board created successfully from template',
          };
        }

        if (contentType === 'sales:pipeline') {
          const { board: boardData, pipeline: pipelineData } = content;
          const { boardId } = input;

          let targetBoardId = boardId;

          // Create board if not provided
          if (!targetBoardId) {
            const newBoard = await models.Boards.createBoard({
              name: boardData.name || 'Untitled Board (from template)',
              userId: currentUser._id,
              order: boardData.order,
            });
            targetBoardId = newBoard._id;
          }

          // Create pipeline with stages
          const { stages, ...pipelineFields } = pipelineData;

          // Clean stages data and add required fields
          const cleanStages = (stages || []).map((stageData: any) => {
            const { itemsTotalCount, unUsedAmount, amount, ...cleanStageData } =
              stageData;
            return {
              ...cleanStageData,
              probability: cleanStageData.probability || '10%',
              type: cleanStageData.type || 'deal',
            };
          });

          const newPipeline = await models.Pipelines.createPipeline(
            {
              ...pipelineFields,
              boardId: targetBoardId,
              userId: currentUser._id,
              type: pipelineFields.type || 'deal',
            },
            cleanStages,
          );

          return {
            status: 'success',
            boardId: targetBoardId,
            pipelineId: newPipeline._id,
            message: 'Pipeline created successfully from template',
          };
        }

        return {
          status: 'error',
          errorMessage: `Unsupported content type: ${contentType}`,
        };
      } catch (error) {
        return {
          status: 'error',
          errorMessage: error.message || 'Failed to use template',
        };
      }
    }),
  },
});
