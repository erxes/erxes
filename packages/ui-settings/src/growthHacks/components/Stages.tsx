import { IStage } from '@erxes/ui-cards/src/boards/types';
import Icon from '@erxes/ui/src/components/Icon';
import SortableList from '@erxes/ui/src/components/SortableList';
import { __ } from '@erxes/ui/src/utils/core';
import { StageList } from '@erxes/ui-settings/src/boards/styles';
import FormBuilder from './FormBuilder';
import React from 'react';
import StageItem from './StageItem';
import { LinkButton } from '@erxes/ui/src/styles/main';

type Props = {
  onChangeStages: (stages: IStage[]) => void;
  stages: any;
};

class Stages extends React.Component<
  Props,
  { isDragDisabled: boolean; currentStage?: IStage }
> {
  constructor(props: Props) {
    super(props);

    this.state = { isDragDisabled: false, currentStage: undefined };
  }

  componentDidMount() {
    if (this.props.stages.length === 0) {
      this.add();
    }
  }

  onChange = (stageId: string, name: string, value: string) => {
    const { stages, onChangeStages } = this.props;

    const stage = stages.find(s => s._id === stageId);
    stage[name] = value;

    onChangeStages(stages);
  };

  add = () => {
    const { stages, onChangeStages } = this.props;

    stages.push({
      _id: Math.random().toString(),
      name: ''
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

  onItemClick = (stage: IStage) => {
    this.setState({ isDragDisabled: true, currentStage: stage });
  };

  onItemModalHide = () => {
    this.setState({ isDragDisabled: false, currentStage: undefined });
  };

  render() {
    const { isDragDisabled, currentStage } = this.state;

    const child = stage => (
      <StageItem
        stage={stage}
        onChange={this.onChange}
        onClick={this.onItemClick}
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
          isDragDisabled={isDragDisabled}
          droppableId="stages"
        />

        <LinkButton onClick={this.add}>
          <Icon icon="plus-1" /> {__('Add another stage')}
        </LinkButton>

        {currentStage && (
          <FormBuilder
            stage={currentStage}
            onHide={this.onItemModalHide}
            onChange={this.onChange}
          />
        )}
      </StageList>
    );
  }
}

export default Stages;
