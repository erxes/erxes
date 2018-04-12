import React from 'react';
import PropTypes from 'prop-types';
import { Tip, Icon } from 'modules/common/components';
import {
  MoveContainer,
  MoveFormContainer,
  PipelineName,
  Stages,
  StageItem
} from '../../styles/deal';
import { DealSelect } from '../';

class DealMove extends React.Component {
  renderStages() {
    const { stages, stageId, onChangeStage } = this.props;

    let isPass = true;

    return (
      <Stages>
        {stages.map(s => {
          const item = (
            <StageItem key={s._id} isPass={isPass}>
              <Tip text={s.name}>
                <a onClick={() => onChangeStage(s._id)}>
                  <Icon icon="ios-checkmark" />
                </a>
              </Tip>
            </StageItem>
          );

          if (s._id === stageId) isPass = false;

          return item;
        })}
      </Stages>
    );
  }

  render() {
    const {
      boards,
      pipelines,
      stages,
      boardId,
      pipelineId,
      stageId,
      onChangeBoard,
      onChangePipeline,
      onChangeStage,
      show,
      toggleForm
    } = this.props;

    const currentPipeline = pipelines.find(p => p._id === pipelineId) || {};

    return (
      <MoveContainer>
        <MoveFormContainer>
          <PipelineName onClick={toggleForm}>
            {currentPipeline.name} <Icon icon="ios-arrow-down" />
          </PipelineName>

          <DealSelect
            show={show}
            boards={boards}
            pipelines={pipelines}
            stages={stages}
            boardId={boardId}
            pipelineId={pipelineId}
            stageId={stageId}
            onChangeBoard={onChangeBoard}
            onChangePipeline={onChangePipeline}
            onChangeStage={onChangeStage}
          />
        </MoveFormContainer>

        {this.renderStages()}
      </MoveContainer>
    );
  }
}

const propTypes = {
  deal: PropTypes.object.isRequired,
  boards: PropTypes.array.isRequired,
  pipelines: PropTypes.array.isRequired,
  stages: PropTypes.array.isRequired,
  boardId: PropTypes.string.isRequired,
  pipelineId: PropTypes.string,
  stageId: PropTypes.string,
  show: PropTypes.bool,
  toggleForm: PropTypes.func.isRequired,
  onChangeBoard: PropTypes.func.isRequired,
  onChangePipeline: PropTypes.func.isRequired,
  onChangeStage: PropTypes.func.isRequired
};

DealMove.propTypes = propTypes;
DealMove.contextTypes = {
  __: PropTypes.func
};

export default DealMove;
