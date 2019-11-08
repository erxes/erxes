import { HeaderContent, HeaderRow, TitleRow } from 'modules/boards/styles/item';
import FormControl from 'modules/common/components/form/Control';
import Icon from 'modules/common/components/Icon';
import React from 'react';
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

class Top extends React.Component<Props> {
  renderMove() {
    const { item, stageId, options, onChangeStage } = this.props;

    return (
      <Move
        options={options}
        item={item}
        stageId={stageId}
        onChangeStage={onChangeStage}
      />
    );
  }

  render() {
    const { saveItem, amount, item } = this.props;

    const onNameBlur = e => {
      const name = e.target.value;

      if (item.name !== name) {
        saveItem({ name: e.target.value });
      }
    };

    const onCloseDateFieldsChange = (name: string, value: any) => {
      saveItem({ [name]: value });
    };

    return (
      <React.Fragment>
        <HeaderRow>
          <HeaderContent>
            <TitleRow>
              <Icon icon="creditcard" />
              <FormControl
                componentClass="textarea"
                defaultValue={item.name}
                required={true}
                onBlur={onNameBlur}
              />
            </TitleRow>
          </HeaderContent>

          {amount && amount()}
        </HeaderRow>

        <HeaderRow>
          <HeaderContent>{this.renderMove()}</HeaderContent>

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
}

export default Top;
