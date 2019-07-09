import { IUser } from 'modules/auth/types';
import {
  HeaderContent,
  HeaderContentSmall,
  HeaderRow
} from 'modules/boards/styles/item';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import React from 'react';
import Datetime from 'react-datetime';
import Move from '../../containers/editForm/Move';
import { IItem, IOptions } from '../../types';

type Props = {
  item: IItem;
  options: IOptions;
  name: string;
  description: string;
  closeDate: Date;
  stageId: string;
  users: IUser[];
  onChangeField: (
    name: 'stageId' | 'name' | 'closeDate' | 'description',
    value: any
  ) => void;
  amount?: () => React.ReactNode;
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
    const { name, closeDate, onChangeField, amount } = this.props;

    const nameOnChange = e =>
      onChangeField('name', (e.target as HTMLInputElement).value);

    const dateOnChange = date => onChangeField('closeDate', date);

    return (
      <React.Fragment>
        <HeaderRow>
          <HeaderContent>
            <ControlLabel>Name</ControlLabel>
            <FormControl
              defaultValue={name}
              required={true}
              onChange={nameOnChange}
            />
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
