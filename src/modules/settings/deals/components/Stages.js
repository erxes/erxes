import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StagesContainer } from '../styles';
import { Button, SortableList } from 'modules/common/components';
import StageItem from './StageItem';

const propTypes = {
  onChangeStages: PropTypes.func.isRequired,
  pipelineId: PropTypes.string.isRequired,
  stages: PropTypes.array.isRequired
};

class Stages extends Component {
  constructor(props) {
    super(props);

    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onStageInputKeyPress = this.onStageInputKeyPress.bind(this);
  }

  onChange(_id, e) {
    const { stages } = this.props;
    const type = e.target.name;

    const stage = stages.find(s => s._id === _id);
    stage[type] = e.target.value;

    this.props.onChangeStages(stages);
  }

  add() {
    const { stages } = this.props;

    stages.push({
      _id: Math.random(),
      name: '',
      pipelineId: this.props.pipelineId
    });

    this.props.onChangeStages(stages);
  }

  remove(_id) {
    const { stages } = this.props;

    const remainedStages = stages.filter(stage => stage._id !== _id);

    this.props.onChangeStages(remainedStages);
  }

  onStageInputKeyPress(e) {
    if (e.key === 'Enter') {
      this.add();
      e.preventDefault();
    }
  }

  render() {
    const child = stage => (
      <StageItem
        stage={stage}
        onChange={this.onChange}
        remove={this.remove}
        onKeyPress={this.onStageInputKeyPress}
      />
    );

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
