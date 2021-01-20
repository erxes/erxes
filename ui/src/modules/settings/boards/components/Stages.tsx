import { IStage } from 'modules/boards/types';
import Icon from 'modules/common/components/Icon';
import SortableList from 'modules/common/components/SortableList';
import { __ } from 'modules/common/utils';
import { LinkButton } from 'modules/settings/team/styles';
import React from 'react';
import { StageList } from '../styles';
import { IOption } from '../types';
import StageItem from './StageItem';

type Props = {
  onChangeStages: (stages: IStage[]) => void;
  stages: any;
  type?: string;
  options?: IOption;
};

class Stages extends React.Component<Props, {}> {
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
    const { options, type } = this.props;
    const Item = options ? options.StageItem : StageItem;

    const child = stage => (
      <Item
        stage={stage}
        type={type}
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
          droppableId="stages"
        />

        <LinkButton onClick={this.add}>
          <Icon icon="plus-1" /> {__('Add another stage')}
        </LinkButton>
      </StageList>
    );
  }
}

export default Stages;
