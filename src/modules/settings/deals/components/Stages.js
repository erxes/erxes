import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StagesContainer } from '../styles';
import { Button, SortableList } from 'modules/common/components';
import StageItem from './StageItem';

const propTypes = {
  onChangeStages: PropTypes.func.isRequired,
  pipelineId: PropTypes.string.isRequired,
  boardId: PropTypes.string.isRequired,
  stages: PropTypes.array.isRequired
};

class Stages extends Component {
  constructor(props) {
    super(props);

    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
    this.onChangeName = this.onChangeName.bind(this);
  }

  onChangeName(_id, e) {
    const stages = this.props.stages;

    const stage = stages.find(s => s._id === _id);
    stage.name = e.target.value;

    this.props.onChangeStages(stages);
  }

  add() {
    const stages = this.props.stages;

    stages.push({
      _id: Math.random(),
      name: '',
      pipelineId: this.props.pipelineId,
      boardId: this.props.boardId
    });

    this.props.onChangeStages(stages);
  }

  remove(_id) {
    const stages = this.props.stages;

    const remainedStages = stages.filter(stage => stage._id !== _id);

    this.props.onChangeStages(remainedStages);
  }

  render() {
    const child = stage => {
      return (
        <StageItem
          stage={stage}
          onChangeName={this.onChangeName}
          remove={this.remove}
        />
      );
    };

    return (
      <StagesContainer>
        <SortableList
          fields={this.props.stages}
          child={child}
          lockAxis="y"
          useDragHandle
          onChangeFields={this.props.onChangeStages}
        />
        <Button onClick={this.add} btnStyle="success" size="small" icon="plus">
          Add stage
        </Button>
      </StagesContainer>
    );
  }
}

Stages.propTypes = propTypes;

export default Stages;
