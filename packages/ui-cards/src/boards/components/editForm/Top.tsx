import {
  HeaderContent,
  HeaderContentSmall,
  HeaderRow,
  TitleRow
} from '../../styles/item';
import { ControlLabel } from '@erxes/ui/src/components/form';
import FormControl from '@erxes/ui/src/components/form/Control';
import Icon from '@erxes/ui/src/components/Icon';
import React, { useEffect, useState } from 'react';
import Move from '../../containers/editForm/Move';
import { IItem, IOptions } from '../../types';
import CloseDate from './CloseDate';
import StartDate from './StartDate';

type Props = {
  item: IItem;
  options: IOptions;
  stageId: string;
  saveItem: (doc: { [key: string]: any }) => void;
  onChangeStage?: (stageId: string) => void;
  amount?: () => React.ReactNode;
};

function Top(props: Props) {
  const { item } = props;

  const [name, setName] = useState(item.name);

  useEffect(() => {
    setName(item.name);
  }, [item.name]);

  function renderMove() {
    const { stageId, options, onChangeStage } = props;

    return (
      <Move
        options={options}
        item={item}
        stageId={stageId}
        onChangeStage={onChangeStage}
      />
    );
  }

  const { saveItem, amount } = props;

  const onNameBlur = () => {
    if (item.name !== name) {
      saveItem({ name });
    }
  };

  const onCloseDateFieldsChange = (key: string, value: any) => {
    saveItem({ [key]: value });
  };

  const onChangeName = e => {
    const itemName = (e.target as HTMLInputElement).value;

    setName(itemName);
    localStorage.setItem(`${props.item._id}Name`, itemName);
  };

  const renderScore = () => {
    const { score } = item;

    if (!score) {
      return null;
    }

    return (
      <HeaderContentSmall>
        <ControlLabel>Score</ControlLabel>
        <p>{score.toLocaleString()}</p>
      </HeaderContentSmall>
    );
  };

  const renderNumber = () => {
    const { number } = item;

    if (!number) {
      return null;
    }

    return (
      <HeaderContentSmall>
        <ControlLabel>Number</ControlLabel>
        <p>{number}</p>
      </HeaderContentSmall>
    );
  };

  return (
    <React.Fragment>
      <HeaderRow>
        <HeaderContent>
          <TitleRow>
            <Icon icon="atm-card" />
            <FormControl
              componentClass="textarea"
              value={name}
              required={true}
              onBlur={onNameBlur}
              onChange={onChangeName}
            />
          </TitleRow>
        </HeaderContent>
        {renderNumber()}
        {renderScore()}
        {amount && amount()}
      </HeaderRow>

      <HeaderRow>
        <HeaderContent>{renderMove()}</HeaderContent>
        <StartDate
          onChangeField={onCloseDateFieldsChange}
          startDate={item.startDate}
          reminderMinute={item.reminderMinute}
        />
        <CloseDate
          onChangeField={onCloseDateFieldsChange}
          closeDate={item.closeDate}
          reminderMinute={item.reminderMinute}
          isComplete={item.isComplete}
        />
      </HeaderRow>
    </React.Fragment>
  );
}

export default Top;
