import { HeaderContent, HeaderRow, TitleRow } from 'modules/boards/styles/item';
import FormControl from 'modules/common/components/form/Control';
import Icon from 'modules/common/components/Icon';
import React, { useEffect, useState } from 'react';
import Move from '../../containers/editForm/Move';
import { IItem, IOptions } from '../../types';
import CloseDate from './CloseDate';

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
    const name = (e.target as HTMLInputElement).value;

    setName(name);
    localStorage.setItem(`${props.item._id}Name`, name);
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

        {amount && amount()}
      </HeaderRow>

      <HeaderRow>
        <HeaderContent>{renderMove()}</HeaderContent>

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
