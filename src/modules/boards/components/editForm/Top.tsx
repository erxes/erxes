import { IUser } from 'modules/auth/types';
import {
  FlexContent,
  HeaderContent,
  HeaderContentSmall,
  HeaderRow,
  Left,
  RightContent
} from 'modules/boards/styles/item';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import SelectTeamMembers from 'modules/settings/team/containers/SelectTeamMembers';
import * as React from 'react';
import * as Datetime from 'react-datetime';
import { Move } from '../../containers/editForm';
import { IItem, IOptions } from '../../types';

type Props = {
  item: IItem;
  options: IOptions;
  name: string;
  description: string;
  closeDate: Date;
  stageId: string;
  assignedUserIds: string[];
  users: IUser[];
  onChangeField: (
    name: 'stageId' | 'name' | 'closeDate' | 'description' | 'assignedUserIds',
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
    const {
      name,
      description,
      closeDate,
      assignedUserIds,
      onChangeField,
      amount
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
