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
import { DealSelect } from '../../containers';

class DealMove extends React.Component {
  constructor(props) {
    super(props);

    this.toggleForm = this.toggleForm.bind(this);

    const { deal: { pipeline, boardId } } = props;

    this.state = {
      show: false,
      stages: props.stages || [],
      pipelineId: pipeline && pipeline._id,
      boardId
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.stages !== nextProps.stages) {
      this.setState({ stages: nextProps.stages });
    }
  }

  onChangeField(name, value) {
    this.setState({ [name]: value });
  }

  toggleForm() {
    this.setState({ show: !this.state.show });
  }

  renderStages() {
    const { stageId, onChangeStage } = this.props;
    const { stages } = this.state;

    let isPass = true;

    return (
      <Stages>
        {stages.map(s => {
          const item = (
            <StageItem key={s._id} isPass={isPass}>
              <Tip text={s.name}>
                <a onClick={() => onChangeStage(s._id)}>
                  <Icon icon="checked-1" />
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

  renderDealSelect() {
    if (!this.state.show) return null;

    const { stageId, onChangeStage } = this.props;
    const { boardId, pipelineId } = this.state;

    return (
      <DealSelect
        stageId={stageId}
        boardId={boardId}
        pipelineId={pipelineId}
        callback={() => this.toggleForm()}
        onChangeStage={onChangeStage}
        onChangeStages={stages => this.onChangeField('stages', stages)}
        onChangePipeline={pipelineId =>
          this.onChangeField('pipelineId', pipelineId)
        }
        onChangeBoard={boardId => this.onChangeField('boardId', boardId)}
      />
    );
  }

  render() {
    const { deal: { pipeline } } = this.props;

    return (
      <MoveContainer>
        <MoveFormContainer>
          <PipelineName onClick={this.toggleForm}>
            {pipeline && pipeline.name} <Icon icon="downarrow" size={10} />
          </PipelineName>

          {this.renderDealSelect()}
        </MoveFormContainer>

        {this.renderStages()}
      </MoveContainer>
    );
  }
}

const propTypes = {
  deal: PropTypes.object.isRequired,
  stages: PropTypes.array,
  stageId: PropTypes.string,
  onChangeStage: PropTypes.func
};

DealMove.propTypes = propTypes;
DealMove.contextTypes = {
  __: PropTypes.func
};

export default DealMove;
