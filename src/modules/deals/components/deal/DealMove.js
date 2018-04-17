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
  constructor(props) {
    super(props);

    this.toggleForm = this.toggleForm.bind(this);

    this.state = { show: false };
  }

  toggleForm() {
    this.setState({ show: !this.state.show });
  }

  renderStages() {
    const { stages, stageId, changeStage } = this.props;

    let isPass = true;

    return (
      <Stages>
        {stages.map(s => {
          const item = (
            <StageItem key={s._id} isPass={isPass}>
              <Tip text={s.name}>
                <a onClick={() => changeStage(s._id)}>
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
      changeStage
    } = this.props;

    const callback = stageId => {
      changeStage(stageId);
      this.toggleForm();
    };

    const currentPipeline = pipelines.find(p => p._id === pipelineId) || {};

    return (
      <MoveContainer>
        <MoveFormContainer>
          <PipelineName onClick={this.toggleForm}>
            {currentPipeline.name} <Icon icon="ios-arrow-down" />
          </PipelineName>

          <DealSelect
            show={this.state.show}
            boards={boards}
            pipelines={pipelines}
            stages={stages}
            boardId={boardId}
            pipelineId={pipelineId}
            stageId={stageId}
            onChangeBoard={onChangeBoard}
            onChangePipeline={onChangePipeline}
            onChangeStage={onChangeStage}
            callback={callback}
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
  onChangeBoard: PropTypes.func.isRequired,
  onChangePipeline: PropTypes.func.isRequired,
  onChangeStage: PropTypes.func.isRequired,
  changeStage: PropTypes.func.isRequired
};

DealMove.propTypes = propTypes;
DealMove.contextTypes = {
  __: PropTypes.func
};

export default DealMove;
