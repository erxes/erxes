import { IUser } from 'modules/auth/types';
import { PriorityIndicator } from 'modules/boards/components/editForm';
import Move from 'modules/boards/containers/editForm/Move';
import { ColorButton } from 'modules/boards/styles/common';
import {
  HeaderContent,
  HeaderRow,
  MetaInfo,
  TitleRow
} from 'modules/boards/styles/item';
import { IItem, IOptions } from 'modules/boards/types';
import FormControl from 'modules/common/components/form/Control';
import React from 'react';

type Props = {
  item: IItem;
  options: IOptions;
  name: string;
  description?: string;
  stageId: string;
  users: IUser[];
  priority: string;
  hackStage: string;
  onChangeField: (name: 'name' | 'stageId', value: any) => void;
  amount?: () => React.ReactNode;
  dueDate: React.ReactNode;
};

class Top extends React.Component<Props> {
  onChangeStage = stageId => {
    this.props.onChangeField('stageId', stageId);
  };

  renderMove() {
    const { item, stageId, options } = this.props;

    return (
      <Move
        options={options}
        item={item}
        stageId={stageId}
        onChangeStage={this.onChangeStage}
      />
    );
  }

  renderHackStage() {
    const { hackStage } = this.props;

    if (!hackStage) {
      return null;
    }

    return (
      <ColorButton color="#666">
        <PriorityIndicator value={hackStage} />
        {hackStage}
      </ColorButton>
    );
  }

  render() {
    const { name, onChangeField, amount, dueDate, priority } = this.props;

    const nameOnChange = e =>
      onChangeField('name', (e.target as HTMLInputElement).value);

    return (
      <>
        <HeaderRow>
          <HeaderContent>
            <TitleRow>
              {priority && <PriorityIndicator value={priority} />}
              <FormControl
                componentClass="textarea"
                defaultValue={name}
                required={true}
                onChange={nameOnChange}
              />
            </TitleRow>
            <MetaInfo>
              {dueDate}
              {this.renderHackStage()}
            </MetaInfo>
          </HeaderContent>

          {amount && amount()}
        </HeaderRow>

        <HeaderRow>
          <HeaderContent>{this.renderMove()}</HeaderContent>
        </HeaderRow>
      </>
    );
  }
}

export default Top;
