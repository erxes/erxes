import Datetime from '@nateradebaugh/react-datetime';
import { IUser } from 'modules/auth/types';
import {
  HeaderContent,
  HeaderContentSmall,
  HeaderRow,
  TitleRow
} from 'modules/boards/styles/item';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import React from 'react';
import Move from '../../containers/editForm/Move';
import { IItem, IOptions } from '../../types';

type Props = {
  item: IItem;
  options: IOptions;
  name: string;
  closeDate: Date;
  stageId: string;
  users: IUser[];
  onChangeField: (name: 'stageId' | 'name' | 'closeDate', value: any) => void;
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
    const { name, closeDate, onChangeField, amount, onBlurFields } = this.props;

    const nameOnChange = e =>
      onChangeField('name', (e.target as HTMLInputElement).value);

    const dateOnChange = date => onChangeField('closeDate', date);

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

          <HeaderContentSmall>
            <FormGroup>
              <ControlLabel>Close date</ControlLabel>
              <Datetime
                inputProps={{ placeholder: 'Click to select a date' }}
                dateFormat="YYYY/MM/DD"
                timeFormat={false}
                value={closeDate}
                closeOnSelect={true}
                onChange={dateOnChange}
                utc={true}
              />
            </FormGroup>
          </HeaderContentSmall>
        </HeaderRow>
      </React.Fragment>
    );
  }
}

export default Top;
