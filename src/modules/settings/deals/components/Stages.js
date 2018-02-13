import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StagesContainer } from '../styles';
import { Spinner, Button, SortableList } from 'modules/common/components';
import StageItem from './StageItem';

const propTypes = {
  stages: PropTypes.array.isRequired,
  save: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
  changeStages: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  pipelineId: PropTypes.string.isRequired,
  boardId: PropTypes.string.isRequired
};

class Stages extends Component {
  constructor(props) {
    super(props);

    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
    this.onChangeFields = this.remove.bind(this);

    this.state = {
      stages: props.stages
    };
  }

  setStates(stages) {
    if (stages && stages.length > 0) {
      this.props.changeStages(stages);
    }
  }

  add() {
    const stages = this.state.stages;

    stages.push({
      name: Math.random().toString(),
      pipelineId: this.props.pipelineId,
      boardId: this.props.boardId
    });

    this.setState({
      stages
    });

    this.setStates(this.state.stages);
  }

  remove(_id) {
    const stages = this.state.stages;

    this.setState({
      stages: stages.filter(stage => stage._id !== _id)
    });

    this.setStates(this.state.stages);
  }

  onChangeFields(stages) {
    this.setState({
      stages
    });

    this.setStates(stages);
  }

  render() {
    if (this.props.loading) {
      return <Spinner />;
    }

    const child = stage => {
      return <StageItem stage={stage} remove={this.remove} />;
    };

    return (
      <StagesContainer>
        <SortableList
          fields={this.state.stages}
          child={child}
          lockAxis="y"
          useDragHandle
          onChangeFields={this.onChangeFields}
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
