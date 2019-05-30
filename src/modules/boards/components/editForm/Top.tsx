import { IUser } from 'modules/auth/types';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import {
  Avatar,
  FlexContent,
  HeaderContent,
  HeaderContentSmall,
  HeaderRow,
  Left,
  RightContent
} from 'modules/deals/styles/deal';
import SelectTeamMembers from 'modules/settings/team/containers/SelectTeamMembers';
import * as React from 'react';
import * as Datetime from 'react-datetime';
import { Item } from '../..//types';
import { Move } from '../../containers/editForm';

type Props = {
  item: Item;
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
    if (Object.keys(amount).length === 0) {
      return null;
    }

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

  onChangeStage = stageId => {
    this.props.onChangeField('stageId', stageId);
  };

  renderMove() {
    const { item, stageId } = this.props;

    return (
      <Move item={item} stageId={stageId} onChangeStage={this.onChangeStage} />
    );
  }

  render() {
    const {
      name,
      description,
      closeDate,
      amount,
      assignedUserIds,
      onChangeField
    } = this.props;

    const nameOnChange = e =>
      onChangeField('name', (e.target as HTMLInputElement).value);

    const dateOnChange = date => onChangeField('closeDate', date);

    const descriptionOnChange = e =>
      onChangeField('description', (e.target as HTMLInputElement).value);

    const userOnChange = usrs => onChangeField('assignedUserIds', usrs);

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

          {this.renderAmount(amount || {})}
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

        <FlexContent>
          <Left>
            <FormGroup>
              <ControlLabel>Description</ControlLabel>
              <FormControl
                componentClass="textarea"
                defaultValue={description}
                onChange={descriptionOnChange}
              />
            </FormGroup>
          </Left>
          <RightContent>
            <FormGroup>
              <ControlLabel>Assigned to</ControlLabel>
              <SelectTeamMembers
                label="Choose users"
                name="assignedUserIds"
                value={assignedUserIds}
                onSelect={userOnChange}
              />
            </FormGroup>
          </RightContent>
        </FlexContent>
      </React.Fragment>
    );
  }
}

export default Top;
