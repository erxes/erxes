import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';
import {
  Button,
  CalenderWrapper,
  CheckBoxWrapper,
  CloseDateContent,
  CloseDateWrapper,
  DateGrid
} from 'modules/boards/styles/popup';
import FormControl from 'modules/common/components/form/Control';
import ControlLabel from 'modules/common/components/form/Label';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { generateButtonClass } from 'modules/boards/utils';

type Props = {
  name: string;
  date: Date;
  isComplete: boolean;
  onChangeField: (value: any) => void;
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
      dueDate: props.date || dayjs()
    };
  }

  setOverlay = overlay => {
    this.overlay = overlay;
  };

  minuteOnChange = ({ value }: { value: string }) => {
    this.props.onChangeField(parseInt(value, 10));
  };

  dateOnChange = date => {
    this.setState({ dueDate: date });
  };

  hideContent = () => {
    this.overlay.hide();
  };

  onSave = () => {
    const { dueDate } = this.state;

    this.props.onChangeField(dueDate);
    this.hideContent();
  };

  remove = () => {
    this.props.onChangeField(null);
    this.hideContent();
  };

  renderContent() {
    const { dueDate } = this.state;

    const day = dayjs(dueDate).format('YYYY/MM/DD');
    const time = dayjs(dueDate).format('HH:mm');

    return (
      <Popover id="pipeline-popover">
        <CloseDateContent>
          {dueDate && (
            <DateGrid>
              <div>
                <ControlLabel>Date</ControlLabel>
                <span>{day}</span>
              </div>
              <div>
                <ControlLabel>Time</ControlLabel>
                <span>{time}</span>
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
              onChange={this.dateOnChange}
              defaultValue={dayjs()
                .startOf('day')
                .add(12, 'hour')
                .format('YYYY-MM-DD HH:mm:ss')}
            />
          </CalenderWrapper>
          <DateGrid>
            <Button colorName="red" onClick={this.remove}>
              Remove
            </Button>
            <Button colorName="green" onClick={this.onSave}>
              Save
            </Button>
          </DateGrid>
        </CloseDateContent>
      </Popover>
    );
  }

  render() {
    const { isComplete, onChangeField, date, name } = this.props;
    const time = dayjs(date).format('HH:mm');

    const onChange = e => onChangeField(e.target.checked);

    const trigger = (
      <Button colorName={generateButtonClass(date, isComplete)}>
        {date ? `${dayjs(date).format('MMM DD')} at ${time}` : name}
      </Button>
    );

    return (
      <CloseDateWrapper innerRef={this.ref}>
        <OverlayTrigger
          ref={this.setOverlay}
          trigger="click"
          placement="bottom-end"
          overlay={this.renderContent()}
          rootClose={true}
          container={this.ref.current}
        >
          <div>
            {date && (
              <CheckBoxWrapper>
                <FormControl
                  checked={isComplete}
                  componentClass="checkbox"
                  onChange={onChange}
                />
              </CheckBoxWrapper>
            )}
            {trigger}
          </div>
        </OverlayTrigger>
      </CloseDateWrapper>
    );
  }
}

export default CloseDate;
