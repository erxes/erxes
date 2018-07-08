import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Datetime from 'react-datetime';
import Select from 'react-select-plus';
import {
  FormGroup,
  FormControl,
  ControlLabel
} from 'modules/common/components';
import { DealMove } from '../../../containers';
import { selectUserOptions } from '../../../utils';
import {
  HeaderContentSmall,
  HeaderRow,
  HeaderContent,
  FlexContent,
  Left,
  Right,
  Avatar,
  SelectValue,
  SelectOption
} from '../../../styles/deal';

const propTypes = {
  deal: PropTypes.object.isRequired,
  name: PropTypes.string,
  description: PropTypes.string,
  closeDate: PropTypes.number,
  amount: PropTypes.object,
  stageId: PropTypes.string,
  assignedUserIds: PropTypes.array,
  users: PropTypes.array,
  onChangeField: PropTypes.func
};

const contextTypes = {
  __: PropTypes.func
};

class Top extends React.Component {
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
        onChangeStage={stageId => onChangeField('stageId', stageId)}
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

    const { __ } = this.context;

    const userValue = option => (
      <SelectValue>
        <Avatar src={option.avatar || '/images/avatar-colored.svg'} />
        {option.label}
      </SelectValue>
    );

    const userOption = option => (
      <SelectOption className="simple-option">
        <Avatar src={option.avatar || '/images/avatar-colored.svg'} />
        <span>{option.label}</span>
      </SelectOption>
    );

    return (
      <Fragment>
        <HeaderRow>
          <HeaderContent>
            <ControlLabel>Name</ControlLabel>
            <FormControl
              defaultValue={name}
              required
              onChange={e => onChangeField('name', e.target.value)}
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
                inputProps={{ placeholder: __('Click to select a date') }}
                dateFormat="YYYY/MM/DD"
                timeFormat={false}
                value={closeDate}
                closeOnSelect
                onChange={closeDate => onChangeField('closeDate', closeDate)}
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
                onChange={e => onChangeField('description', e.target.value)}
              />
            </FormGroup>
          </Left>
          <Right>
            <FormGroup>
              <ControlLabel>Assigned to</ControlLabel>
              <Select
                placeholder={__('Choose users')}
                value={assignedUserIds}
                onChange={users =>
                  onChangeField(
                    'assignedUserIds',
                    users.map(user => user.value)
                  )
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
      </Fragment>
    );
  }
}

Top.propTypes = propTypes;
Top.contextTypes = contextTypes;

export default Top;
