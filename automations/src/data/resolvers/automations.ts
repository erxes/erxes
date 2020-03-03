import { Shapes } from '../../models';
import { IAutomationDocument } from '../../models/definitions/Automations';
import { TRIGGER_KIND } from '../../models/definitions/constants';

export default {
  async shapes(automation: IAutomationDocument) {
    const shapes = await Shapes.find({ automationId: automation._id });

    for (const shape of shapes) {
      switch (shape.kind) {
        case TRIGGER_KIND.CHANGE_DEAL:
          shape.config.destinationStageId = shape.config.destinationStageId || '';
          shape.configFormat.destinationStageId = {
            component: 'modules/boards/containers/BoardSelect',
            props: {
              type: 'deal',
              stageId: shape.config.destinationStageId || '',
              boardId: 'boardId',
              pipelineId: 'pipelineId',
              // callback: () => void,
              // onChangeStage?: (stageId: string) => void,
              // onChangePipeline: (pipelineId: string, stages: IStage[]) => void,
              // onChangeBoard: (boardId: string) => void,
              // autoSelectStage?: boolean,
            },
          };
          break;
      }
    }

    return shapes;
  },
};
