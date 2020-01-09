import { PriorityIndicator } from 'modules/boards/components/editForm';
import Move from 'modules/boards/containers/editForm/Move';
import { ColorButton } from 'modules/boards/styles/common';
import {
  HeaderContent,
  HeaderRow,
  MetaInfo,
  TitleRow
} from 'modules/boards/styles/item';
import { IOptions } from 'modules/boards/types';
import FormControl from 'modules/common/components/form/Control';
import Participators from 'modules/inbox/components/conversationDetail/workarea/Participators';
import React from 'react';
import { IGrowthHack } from '../../types';

type Props = {
  item: IGrowthHack;
  options: IOptions;
  saveItem: (doc: { [key: string]: any }) => void;
  onChangeStage: (stageId: string) => void;
  score?: () => React.ReactNode;
  dueDate?: React.ReactNode;
};

class Top extends React.Component<Props> {
  renderMove() {
    const { item, options, onChangeStage } = this.props;

    return (
      <Move
        options={options}
        item={item}
        stageId={item.stageId}
        onChangeStage={onChangeStage}
      />
    );
  }

  renderHackStage() {
    const hackStages = this.props.item.hackStages || [];

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
    const { saveItem, score, dueDate, item } = this.props;
    const { assignedUsers = [], name, priority } = item;

    const onNameBlur = e => {
      const value = e.target.value;

      if (name !== value) {
        saveItem({ name: e.target.value });
      }
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
                onBlur={onNameBlur}
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
