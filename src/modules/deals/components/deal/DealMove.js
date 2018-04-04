import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select-plus';
import {
  Button,
  FormGroup,
  ControlLabel,
  Tip,
  Icon
} from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { selectOptions } from '../../utils';
import {
  MoveContainer,
  MoveFormContainer,
  PipelineName,
  Stages,
  StageItem,
  FormFooter
} from '../../styles/deal';

class DealMoveForm extends React.Component {
  constructor(props) {
    super(props);

    this.toggleForm = this.toggleForm.bind(this);
    this.move = this.move.bind(this);

    this.state = {
      stageId: props.deal.stageId,
      show: false
    };
  }

  toggleForm() {
    this.setState({ show: !this.state.show });
  }

  move() {
    const { deal } = this.props;
    const { stageId } = this.state;
    const { __ } = this.context;

    if (!stageId) return Alert.error(__('No stage'));

    const doc = {
      stageId,
      _id: deal._id
    };

    this.props.moveDeal(doc);
  }

  onChangeStage(stage) {
    if (stage) this.setState({ stageId: stage.value });
  }

  changeStage(stageId) {
    this.setState({ stageId }, () => this.move());
  }

  renderSelect(placeholder, value, onChange, options) {
    return (
      <Select
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        optionRenderer={option => (
          <div className="simple-option">
            <span>{option.label}</span>
          </div>
        )}
        options={options}
        clearable={false}
      />
    );
  }

  renderForm() {
    if (!this.state.show) return null;

    const { __ } = this.context;
    const { boards, pipelines, stages, boardId, pipelineId } = this.props;

    return (
      <form>
        <FormGroup>
          <ControlLabel>Board</ControlLabel>
          {this.renderSelect(
            __('Choose a board'),
            boardId,
            board => this.props.onChangeBoard(board),
            selectOptions(boards)
          )}
        </FormGroup>

        <FormGroup>
          <ControlLabel>Pipeline</ControlLabel>
          {this.renderSelect(
            __('Choose a pipeline'),
            pipelineId,
            pipeline => this.props.onChangePipeline(pipeline),
            selectOptions(pipelines)
          )}
        </FormGroup>

        <FormGroup>
          <ControlLabel>Stage</ControlLabel>
          {this.renderSelect(
            __('Choose a stage'),
            this.state.stageId,
            stage => this.onChangeStage(stage),
            selectOptions(stages)
          )}
        </FormGroup>

        <FormFooter>
          <Button
            size="small"
            btnStyle="simple"
            onClick={this.toggleForm}
            icon="close"
          >
            Close
          </Button>

          <Button
            btnStyle="success"
            size="small"
            onClick={() => {
              this.move();
              this.toggleForm();
            }}
            icon="checkmark"
          >
            Move
          </Button>
        </FormFooter>
      </form>
    );
  }

  renderStages() {
    const { stages } = this.props;
    const { stageId } = this.state;

    let isPass = true;

    return (
      <Stages>
        {stages.map(s => {
          const item = (
            <StageItem key={s._id} isPass={isPass}>
              <Tip text={s.name}>
                <a onClick={() => this.changeStage(s._id)}>
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
    const { pipelines, pipelineId } = this.props;
    const currentPipeline = pipelines.find(p => p._id === pipelineId);

    return (
      <MoveContainer>
        <MoveFormContainer>
          <PipelineName onClick={this.toggleForm}>
            {currentPipeline.name} <Icon icon="ios-arrow-down" />
          </PipelineName>

          {this.renderForm()}
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
  pipelineId: PropTypes.string.isRequired,
  onChangeBoard: PropTypes.func.isRequired,
  onChangePipeline: PropTypes.func.isRequired,
  moveDeal: PropTypes.func.isRequired
};

DealMoveForm.propTypes = propTypes;
DealMoveForm.contextTypes = {
  __: PropTypes.func,
  closeModal: PropTypes.func.isRequired
};

export default DealMoveForm;
