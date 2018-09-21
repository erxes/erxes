import { Button, SortableList } from 'modules/common/components';
import React, { Component } from 'react';
import { StageList } from '../styles';
import { IStage } from '../types';
import StageItem from './StageItem';

type Props = {
  onChangeStages: (stages: IStage[]) => void;
  stages: any;
};

class Stages extends Component<Props, {}> {
  constructor(props: Props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
    this.onStageInputKeyPress = this.onStageInputKeyPress.bind(this);
  }

  componentDidMount() {
    if (this.props.stages.length === 0) {
      this.add();
    }
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
      <StageList>
        <SortableList
          fields={this.props.stages}
          child={child}
          onChangeFields={this.props.onChangeStages}
          isModal={true}
        />
        <Button onClick={this.add} btnStyle="success" size="small" icon="add">
          Add stage
        </Button>
      </StageList>
    );
  }
}

export default Stages;
