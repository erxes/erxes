import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';
import {
  ActivityDate,
  Date,
  Detail,
  FlexBody,
  FlexCenterContent,
  FlexContent,
  Row,
  Title
} from 'modules/activityLogs/styles';
import { REMINDER_MINUTES } from 'modules/boards/constants';
import { IItem } from 'modules/boards/types';
import { selectOptions } from 'modules/boards/utils';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import SelectTeamMembers from 'modules/settings/team/containers/SelectTeamMembers';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import Select from 'react-select-plus';

type Props = {
  task: IItem;
};

type State = {
  editing: boolean;
  assignedUsers: [];
  inputValue: string;
  closeDate: Date;
  reminderMinute: number;
  showDetail: boolean;
};

class Task extends React.Component<Props, State> {
  private overlayTrigger;

  constructor(props) {
    super(props);

    this.state = {
      editing: false,
      inputValue: '',
      assignedUsers: props.task.assignedUserIds || [],
      closeDate: props.task.closeDate || dayjs(),
      reminderMinute: props.task.reminderMinute,
      showDetail: false
    };
  }

  onOverlayClose = () => {
    this.overlayTrigger.hide();
  };

  onNameChange = () => {
    this.setState({ editing: !this.state.editing });
  };

  onDetailClick = () => {
    this.setState({ showDetail: !this.state.showDetail });
  };

  handleInputChange = e => {
    e.preventDefault();

    this.setState({ inputValue: e.target.value });
  };

  renderName() {
    const { task } = this.props;

    if (this.state.editing) {
      return (
        <>
          <FormGroup>
            <FormControl value={task.name} onChange={this.handleInputChange} />
          </FormGroup>
          <Button
            icon="cancel-1"
            btnStyle="simple"
            size="small"
            onClick={this.onNameChange}
          >
            Cancel
          </Button>
          <Button
            btnStyle="success"
            size="small"
            icon="checked-1"
            // onClick={this.handleSave}
          >
            Save
          </Button>
        </>
      );
    }

    return (
      <h4>
        <Icon icon="checked-1" />
        {task.name}
      </h4>
    );
  }

  renderDetails() {
    const { showDetail } = this.state;

    if (!showDetail) {
      return null;
    }

    return (
      <Detail>
        <FlexContent>
          <FlexBody>
            <Row>
              <ControlLabel>Type</ControlLabel>
              <Select
                isRequired={true}
                options={selectOptions(REMINDER_MINUTES)}
                clearable={false}
                placeholder="Set reminder"
              />
            </Row>
          </FlexBody>
          <FlexBody>
            <Row>
              <ControlLabel>Type</ControlLabel>
              <Select
                isRequired={true}
                options={selectOptions(REMINDER_MINUTES)}
                clearable={false}
                placeholder="Set reminder"
              />
            </Row>
          </FlexBody>
        </FlexContent>
      </Detail>
    );
  }

  renderReminderMinute() {
    const { reminderMinute } = this.state;

    const minuteOnChange = ({ value }: { value: string }) => {
      this.setState({ reminderMinute: parseInt(value, 10) });
    };

    return (
      <FlexBody>
        <Select
          isRequired={true}
          value={reminderMinute}
          onChange={minuteOnChange}
          options={selectOptions(REMINDER_MINUTES)}
          clearable={false}
          placeholder="Set reminder"
        />
      </FlexBody>
    );
  }

  renderCloseDate() {
    const { closeDate } = this.state;

    const onDateChange = date => {
      this.setState({ closeDate: date });
    };

    const content = (
      <Popover id="pipeline-popover">
        <Datetime
          inputProps={{ placeholder: 'Click to select a date' }}
          dateFormat="YYYY/MM/DD"
          timeFormat="HH:mm"
          value={closeDate}
          closeOnSelect={true}
          utc={true}
          input={false}
          onChange={onDateChange}
          defaultValue={dayjs()
            .startOf('day')
            .add(12, 'hour')
            .format('YYYY-MM-DD HH:mm:ss')}
        />
      </Popover>
    );

    return (
      <OverlayTrigger
        ref={overlayTrigger => {
          this.overlayTrigger = overlayTrigger;
        }}
        trigger="click"
        placement="bottom"
        overlay={content}
        rootClose={true}
        container={this}
      >
        <Date>
          <Icon icon="calendar-alt" />
          <span>{dayjs(closeDate).format('MM/DD/YYYY')}</span>
          <Icon icon="downarrow" />
        </Date>
      </OverlayTrigger>
    );
  }

  renderContent() {
    const { task } = this.props;
    const { assignedUsers, showDetail } = this.state;
    // tslint:disable
    console.log(task);
    const onAssignedUserSelect = assignedUsers => {
      this.setState({ assignedUsers });
    };

    return (
      <>
        <FlexContent>
          <Title onClick={this.onNameChange}>{this.renderName()}</Title>
        </FlexContent>
        <FlexContent>
          <FlexBody>
            <Row>
              <ControlLabel>Assigned to</ControlLabel>
              <SelectTeamMembers
                label="Choose team member"
                name="assignedUserIds"
                value={assignedUsers}
                onSelect={onAssignedUserSelect}
              />
            </Row>
          </FlexBody>
          <FlexBody>
            <Row>
              <ControlLabel>Due date</ControlLabel>
              <FlexContent>
                {this.renderCloseDate()}
                {this.renderReminderMinute()}
              </FlexContent>
            </Row>
          </FlexBody>
        </FlexContent>
        {/* {task.description && ( */}
        <Title>{task.description}eewwfefwefwfe</Title>
        {/* )} */}
        <FlexBody>
          <Date onClick={this.onDetailClick} showDetail={showDetail}>
            <Icon icon="rightarrow-2" /> {__('Details')}
          </Date>
          {this.renderDetails()}
        </FlexBody>
      </>
    );
  }

  render() {
    const { createdAt } = this.props.task;

    return (
      <>
        <FlexCenterContent>
          <FlexBody>
            <strong>Somebody created task</strong>
          </FlexBody>
          <Tip text={dayjs(createdAt).format('llll')}>
            <ActivityDate>
              {dayjs(createdAt).format('MMM D, h:mm A')}
            </ActivityDate>
          </Tip>
        </FlexCenterContent>
        {this.renderContent()}
      </>
    );
  }
}

export default Task;
