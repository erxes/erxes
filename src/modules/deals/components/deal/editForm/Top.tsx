import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import * as Datetime from 'react-datetime';
import Select from 'react-select-plus';
import { IUser } from '../../../../auth/types';
import { DealMove } from '../../../containers';
import {
  Avatar,
  FlexContent,
  HeaderContent,
  HeaderContentSmall,
  HeaderRow,
  Left,
  Right,
  SelectOption,
  SelectValue
} from '../../../styles/deal';
import { IDeal } from '../../../types';
import { selectUserOptions } from '../../../utils';

type Props = {
  deal: IDeal;
  name: string;
  description: string;
  closeDate: Date;
  amount: { [key: string]: number };
  stageId: string;
  assignedUserIds: string[];
  users: IUser[];
  onChangeField: (
    name: 'stageId' | 'name' | 'closeDate' | 'description' | 'assignedUserIds',
    value: any
  ) => void;
};

class Top extends React.Component<Props> {
  renderAmount(amount) {
    if (Object.keys(amount).length === 0) return null;

    return (
      <HeaderContentSmall>
        <ControlLabel>Amount</ControlLabel>
        {Object.keys(amount).map(key => (
          <p key={key}>
            {amount[key].toLocaleString()} {key}
          </p>
        ))}
      </HeaderContentSmall>
    );
  }

  renderDealMove() {
    const { deal, stageId, onChangeField } = this.props;

    return (
      <DealMove
        deal={deal}
        stageId={stageId}
        onChangeStage={stgId => onChangeField('stageId', stgId)}
      />
    );
  }

  render() {
    const {
      name,
      description,
      closeDate,
      amount,
      assignedUserIds,
      users,
      onChangeField
    } = this.props;

    const content = option => (
      <React.Fragment>
        <Avatar src={option.avatar || '/images/avatar-colored.svg'} />
        {option.label}
      </React.Fragment>
    );

    const userValue = option => <SelectValue>{content(option)}</SelectValue>;

    const userOption = option => (
      <SelectOption className="simple-option">{content(option)}</SelectOption>
    );

    return (
      <React.Fragment>
        <HeaderRow>
          <HeaderContent>
            <ControlLabel>Name</ControlLabel>
            <FormControl
              defaultValue={name}
              required
              onChange={e =>
                onChangeField('name', (e.target as HTMLInputElement).value)
              }
            />
          </HeaderContent>

          {this.renderAmount(amount || {})}
        </HeaderRow>

        <HeaderRow>
          <HeaderContent>{this.renderDealMove()}</HeaderContent>

          <HeaderContentSmall>
            <FormGroup>
              <ControlLabel>Close date</ControlLabel>
              <Datetime
                inputProps={{ placeholder: 'Click to select a date' }}
                dateFormat="YYYY/MM/DD"
                timeFormat={false}
                value={closeDate}
                closeOnSelect
                onChange={date => onChangeField('closeDate', date)}
              />
            </FormGroup>
          </HeaderContentSmall>
        </HeaderRow>

        <FlexContent>
          <Left>
            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl
                componentClass="textarea"
                defaultValue={description}
                onChange={e =>
                  onChangeField(
                    'description',
                    (e.target as HTMLInputElement).value
                  )
                }
              />
            </FormGroup>
          </Left>
          <Right>
            <FormGroup>
              <ControlLabel>Assigned to</ControlLabel>
              <Select
                placeholder={__('Choose users')}
                value={assignedUserIds}
                onChange={usrs =>
                  onChangeField('assignedUserIds', usrs.map(user => user.value))
                }
                optionRenderer={userOption}
                valueRenderer={userValue}
                removeSelected={true}
                options={selectUserOptions(users)}
                multi
              />
            </FormGroup>
          </Right>
        </FlexContent>
      </React.Fragment>
    );
  }
}

export default Top;
