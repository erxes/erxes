import { IStage } from 'modules/boards/types';
import Button from 'modules/common/components/Button';
import React from 'react';
import { StageList } from '../styles';
import StageItem from './StageItem';

type Props = {
  onChangeStages: (stages: IStage[]) => void;
  stages: any;
  type: string;
};

class Stages extends React.Component<Props, {}> {
  componentDidMount() {
    if (this.props.stages.length === 0) {
      this.add();
    }
  }

  onChange = (stageId, e) => {
    const { name, value } = e.target;
    const { stages, onChangeStages } = this.props;

    const stage = stages.find(s => s._id === stageId);
    stage[name] = value;

    onChangeStages(stages);
  };

  add = () => {
    const { stages, onChangeStages, type } = this.props;

    stages.push({
      _id: Math.random().toString(),
      name: '',
      type
    });

    onChangeStages(stages);
  };

  remove = stageId => {
    const { stages, onChangeStages } = this.props;

    const remainedStages = stages.filter(stage => stage._id !== stageId);

    onChangeStages(remainedStages);
  };

  onStageInputKeyPress = e => {
    if (e.key === 'Enter') {
      this.add();
      e.preventDefault();
    }
  };

  render() {
    return (
      <StageList>
        {this.props.stages.map((stage: IStage) => (
          <StageItem
            key={stage._id}
            stage={stage}
            onChange={this.onChange}
            remove={this.remove}
            type={this.props.type}
            onKeyPress={this.onStageInputKeyPress}
          />
        ))}
        <Button onClick={this.add} btnStyle="success" size="small" icon="add">
          Add stage
        </Button>
      </StageList>
    );
  }
}

export default Stages;
