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
import Participators from 'modules/inbox/components/conversationDetail/workarea/Participators';
import React from 'react';

type Props = {
  item: IItem;
  options: IOptions;
  name: string;
  stageId: string;
  priority: string;
  hackStages: string[];
  onChangeField: (name: 'name' | 'stageId', value: any) => void;
  onBlurFields: (name: 'description' | 'name', value: string) => void;
  score?: () => React.ReactNode;
  dueDate?: React.ReactNode;
  formSubmissions: JSON;
};

class Top extends React.Component<Props> {
  onChangeStage = stageId => {
    const { onChangeField } = this.props;

    onChangeField('stageId', stageId);
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
    const { hackStages } = this.props;

    if (hackStages.length === 0) {
      return null;
    }

    return (
      <ColorButton color="#666">
        {hackStages.map(i => (
          <span key={i}>
            <PriorityIndicator value={i} />
            {i}
          </span>
        ))}
      </ColorButton>
    );
  }

  render() {
    const {
      name,
      onChangeField,
      score,
      dueDate,
      priority,
      onBlurFields,
      item
    } = this.props;

    const { assignedUsers = [] } = item;

    const nameOnChange = e =>
      onChangeField('name', (e.target as HTMLInputElement).value);

    const onSaveName = e => {
      onBlurFields('name', e.target.value);
    };

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
                onBlur={onSaveName}
              />
            </TitleRow>
            <MetaInfo>
              {assignedUsers.length > 0 && (
                <Participators participatedUsers={assignedUsers} limit={3} />
              )}
              {dueDate}
              {this.renderHackStage()}
            </MetaInfo>
          </HeaderContent>

          {score && score()}
        </HeaderRow>

        <HeaderRow>
          <HeaderContent>{this.renderMove()}</HeaderContent>
        </HeaderRow>
      </>
    );
  }
}

export default Top;
