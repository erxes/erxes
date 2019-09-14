import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';
import { HeaderContentSmall } from 'modules/boards/styles/item';
import {
  Button,
  CalenderWrapper,
  CheckBoxWrapper,
  CloseDateWrapper,
  ShowDate
} from 'modules/boards/styles/popup';
import FormControl from 'modules/common/components/form/Control';
import ControlLabel from 'modules/common/components/form/Label';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import React from 'react';
import Select from 'react-select-plus';
import { selectOptions } from '../../utils';

type Props = {
  closeDate: Date;
  isComplete: boolean;
  reminderMinute: number;
  onChangeField: (
    name: 'closeDate' | 'reminderMinute' | 'isComplete',
    value: any
  ) => void;
};

export default (props: Props) => {
  const { onChangeField, closeDate, isComplete, reminderMinute } = props;

  const day = dayjs(closeDate).format('YYYY/MM/DD');
  const time = dayjs(closeDate).format('HH:mm');

  const options = [
    { _id: '0', name: 'At Time of Due Date' },
    { _id: '5', name: '5 Minutes Before' },
    { _id: '10', name: '10 Minutes Before' },
    { _id: '15', name: '15 Minutes Before' },
    { _id: '60', name: '1 Hour Before' },
    { _id: '120', name: '2 Hour Before' },
    { _id: '1440', name: '1 Day Before' },
    { _id: '2880', name: '2 Day Before' }
  ];

  const onChange = e => onChangeField('isComplete', e.target.checked);
  const dateOnChange = date => onChangeField('closeDate', date);
  const minuteOnChange = option =>
    onChangeField('reminderMinute', parseInt(option.value, 10));

  const title = 'Close date';

  const trigger = (
    <Button
      extra={closeDate ? true : false}
      colorName={isComplete ? 'green' : ''}
    >
      {closeDate ? (
        <div>
          {dayjs(closeDate).format('MMM DD')} at ${time}
        </div>
      ) : (
        title
      )}
    </Button>
  );

  const content = formProps => (
    <div>
      {closeDate && (
        <ShowDate>
          <div>
            <ControlLabel>Date</ControlLabel>
            <span>{day}</span>
          </div>
          <div>
            <ControlLabel>Time</ControlLabel>
            <span>{time}</span>
          </div>
        </ShowDate>
      )}

      <CalenderWrapper>
        <Datetime
          inputProps={{ placeholder: 'Click to select a date' }}
          dateFormat="YYYY/MM/DD"
          timeFormat="HH:mm"
          value={closeDate}
          closeOnSelect={true}
          onChange={dateOnChange}
          utc={true}
          input={false}
        />
      </CalenderWrapper>

      <ControlLabel>Set reminder</ControlLabel>
      <Select
        isRequired={true}
        value={reminderMinute}
        onChange={minuteOnChange}
        options={selectOptions(options)}
        clearable={false}
      />
    </div>
  );

  return (
    <HeaderContentSmall>
      <CloseDateWrapper>
        {closeDate && (
          <CheckBoxWrapper>
            <FormControl
              checked={isComplete}
              componentClass="checkbox"
              onChange={onChange}
            />
          </CheckBoxWrapper>
        )}
        <ModalTrigger
          title={title}
          trigger={trigger}
          content={content}
          dialogClassName="modal-close-date"
        />
      </CloseDateWrapper>
    </HeaderContentSmall>
  );
};
