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
import React, { useEffect, useState } from 'react';
import { IGrowthHack } from '../../types';

type Props = {
  item: IGrowthHack;
  options: IOptions;
  saveItem: (doc: { [key: string]: any }) => void;
  onChangeStage: (stageId: string) => void;
  score?: () => React.ReactNode;
  dueDate?: React.ReactNode;
};

function Top(props: Props) {
  const { item } = props;

  const [name, setName] = useState(item.name);

  useEffect(() => {
    setName(item.name);
  }, [item.name]);

  function renderMove() {
    const { options, onChangeStage } = props;

    return (
      <Move
        options={options}
        item={item}
        stageId={item.stageId}
        onChangeStage={onChangeStage}
      />
    );
  }

  function renderHackStage() {
    const hackStages = props.item.hackStages || [];

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

  const { saveItem, score, dueDate } = props;
  const { assignedUsers = [], priority } = item;

  const onNameBlur = e => {
    if (item.name !== name) {
      saveItem({ name });
    }
  };

  const onChangeName = e => {
    setName(e.target.value);
  };

  return (
    <>
      <HeaderRow>
        <HeaderContent>
          <TitleRow>
            {priority && <PriorityIndicator value={priority} />}
            <FormControl
              componentClass="textarea"
              value={name}
              required={true}
              onBlur={onNameBlur}
              onChange={onChangeName}
            />
          </TitleRow>
          <MetaInfo>
            {assignedUsers.length > 0 && (
              <Participators participatedUsers={assignedUsers} limit={3} />
            )}
            {dueDate}
            {renderHackStage()}
          </MetaInfo>
        </HeaderContent>

        {score && score()}
      </HeaderRow>

      <HeaderRow>
        <HeaderContent>{renderMove()}</HeaderContent>
      </HeaderRow>
    </>
  );
}

export default Top;
