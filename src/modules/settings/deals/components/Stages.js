import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StagesContainer } from '../styles';
import { Button, SortableList } from 'modules/common/components';
import StageItem from './StageItem';

const propTypes = {
  onChangeStages: PropTypes.func.isRequired,
  stages: PropTypes.array.isRequired
};

class Stages extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
    this.onStageInputKeyPress = this.onStageInputKeyPress.bind(this);
  }

  onChange(_id, e) {
    const { name, value } = e.target;
    const { stages, onChangeStages } = this.props;

    const stage = stages.find(s => s._id === _id);
    stage[name] = value;

    onChangeStages(stages);
  }

  add() {
    const { stages, onChangeStages } = this.props;

    stages.push({
      _id: Math.random(),
      name: ''
    });

    onChangeStages(stages);
  }

  remove(_id) {
    const { stages, onChangeStages } = this.props;

    const remainedStages = stages.filter(stage => stage._id !== _id);

    onChangeStages(remainedStages);
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
          onChangeFields={this.props.onChangeStages}
          isModal={true}
        />
        <Button onClick={this.add} btnStyle="success" size="small" icon="add">
          Add stage
        </Button>
      </StagesContainer>
    );
  }
}

Stages.propTypes = propTypes;

export default Stages;
