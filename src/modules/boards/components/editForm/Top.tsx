import { IUser } from 'modules/auth/types';
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
  name: string;
  closeDate: Date;
  reminderMinute: number;
  isComplete: boolean;
  stageId: string;
  users: IUser[];
  onChangeField: (
    name: 'stageId' | 'name' | 'closeDate' | 'reminderMinute' | 'isComplete',
    value: any
  ) => void;
  amount?: () => React.ReactNode;
  onBlurFields: (name: 'description' | 'name', value: string) => void;
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

  render() {
    const {
      name,
      closeDate,
      onChangeField,
      amount,
      onBlurFields,
      reminderMinute,
      isComplete
    } = this.props;

    const nameOnChange = e =>
      onChangeField('name', (e.target as HTMLInputElement).value);

    const onNameBlur = e => {
      onBlurFields('name', e.target.value);
    };

    return (
      <React.Fragment>
        <HeaderRow>
          <HeaderContent>
            <TitleRow>
              <Icon icon="creditcard" />
              <FormControl
                defaultValue={name}
                required={true}
                onChange={nameOnChange}
                onBlur={onNameBlur}
              />
            </TitleRow>
          </HeaderContent>

          {amount && amount()}
        </HeaderRow>

        <HeaderRow>
          <HeaderContent>{this.renderMove()}</HeaderContent>

          <CloseDate
            onChangeField={onChangeField}
            closeDate={closeDate}
            reminderMinute={reminderMinute}
            isComplete={isComplete}
          />
        </HeaderRow>
      </React.Fragment>
    );
  }
}

export default Top;
