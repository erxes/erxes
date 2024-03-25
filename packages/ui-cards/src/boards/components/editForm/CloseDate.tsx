import {
  Button,
  CalenderWrapper,
  CheckBoxWrapper,
  CloseDateContent,
  CloseDateWrapper,
  DateGrid,
} from '../../styles/popup';
import React from 'react';
import Select from 'react-select';
import { generateButtonClass, selectOptions } from '../../utils';

import ControlLabel from '@erxes/ui/src/components/form/Label';
import Datetime from '@nateradebaugh/react-datetime';
import FormControl from '@erxes/ui/src/components/form/Control';
import Popover from '@erxes/ui/src/components/Popover';
import { REMINDER_MINUTES } from '../../constants';
import dayjs from 'dayjs';

type Props = {
  closeDate: Date;
  createdDate: Date;
  isCheckDate?: boolean;
  isComplete: boolean;
  reminderMinute: number;
  onChangeField: (
    name: 'closeDate' | 'reminderMinute' | 'isComplete',
    value: any,
  ) => void;
};

type State = {
  dueDate: Date;
};

class CloseDate extends React.Component<Props, State> {
  private ref;
  private overlay: any;

  constructor(props) {
    super(props);

    this.ref = React.createRef();

    this.state = {
      dueDate: props.closeDate || dayjs(),
    };
  }

  setOverlay = (overlay) => {
    this.overlay = overlay;
  };

  minuteOnChange = ({ value }: { value: string }) => {
    this.props.onChangeField('reminderMinute', parseInt(value, 10));
  };

  dateOnChange = (date) => {
    this.setState({ dueDate: date });
  };

  hideContent = () => {
    this.overlay.hide();
  };

  onSave = () => {
    const { dueDate } = this.state;

    this.props.onChangeField('closeDate', dueDate);
    this.hideContent();
  };

  remove = () => {
    this.props.onChangeField('closeDate', null);
    this.hideContent();
  };

  renderContent() {
    const { reminderMinute, isCheckDate, createdDate } = this.props;
    const { dueDate } = this.state;

    const checkedDate = new Date(
      Math.max(new Date(dueDate).getTime(), new Date(createdDate).getTime()),
    );
    const day = isCheckDate
      ? dayjs(checkedDate).format('YYYY-MM-DD')
      : dayjs(dueDate).format('YYYY-MM-DD');

    const time = dayjs(dueDate).format('HH:mm');

    const renderValidDate = (current) => {
      return isCheckDate
        ? dayjs(current).isAfter(dayjs(createdDate).subtract(1, 'day'))
        : true;
    };

    const onChangeDateTime = (e) => {
      const type = e.target.type;
      const value = e.target.value;

      const oldDay = dayjs(dueDate).format('YYYY/MM/DD');
      const oldTime = dayjs(dueDate).format('HH:mm');
      let newDate = dueDate;

      if (type === 'date') {
        newDate = new Date(value.concat(' ', oldTime));
      }

      if (type === 'time') {
        newDate = new Date(oldDay.concat(' ', value));
      }

      this.setState({ dueDate: newDate });
    };

    return (
      <CloseDateContent>
        {dueDate && (
          <DateGrid>
            <div>
              <ControlLabel>Date</ControlLabel>
              <input type="date" value={day} onChange={onChangeDateTime} />
            </div>
            <div>
              <ControlLabel>Time</ControlLabel>
              <input type="time" value={time} onChange={onChangeDateTime} />
            </div>
          </DateGrid>
        )}

        <CalenderWrapper>
          <Datetime
            inputProps={{ placeholder: 'Click to select a date' }}
            dateFormat="YYYY/MM/DD"
            timeFormat="HH:mm"
            value={dueDate}
            closeOnSelect={true}
            utc={true}
            input={false}
            isValidDate={renderValidDate}
            onChange={this.dateOnChange}
            defaultValue={dayjs()
              .startOf('day')
              .add(12, 'hour')
              .format('YYYY-MM-DD HH:mm:ss')}
          />
        </CalenderWrapper>

        <ControlLabel>Set reminder</ControlLabel>
        
          <Select
            required={true}
            value={reminderMinute}
            onChange={this.minuteOnChange}
            options={selectOptions(REMINDER_MINUTES)}
            isClearable={false}
          />

        <DateGrid>
          <Button colorname="red" onClick={this.remove}>
            Remove
          </Button>
          <Button colorname="green" onClick={this.onSave}>
            Save
          </Button>
        </DateGrid>
      </CloseDateContent>
    );
  }

  render() {
    const { isComplete, onChangeField, closeDate } = this.props;
    const time = dayjs(closeDate).format('HH:mm');

    const onChange = (e) => onChangeField('isComplete', e.target.checked);

    const trigger = (
      <Button colorname={generateButtonClass(closeDate, isComplete)}>
        {closeDate
          ? `${dayjs(closeDate).format('MMM DD')} at ${time}`
          : 'Close date'}
      </Button>
    );

    return (
      <CloseDateWrapper innerRef={this.ref}>
        <Popover placement="bottom-end" trigger={trigger}>
          {this.renderContent()}
        </Popover>
        {closeDate && (
          <CheckBoxWrapper>
            <FormControl
              checked={isComplete}
              componentClass="checkbox"
              onChange={onChange}
            />
          </CheckBoxWrapper>
        )}
      </CloseDateWrapper>
    );
  }
}

export default CloseDate;
