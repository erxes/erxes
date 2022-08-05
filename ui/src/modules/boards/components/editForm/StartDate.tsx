import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';
import {
  Button,
  CalenderWrapper,
  CloseDateContent,
  CloseDateWrapper,
  DateGrid
} from 'modules/boards/styles/popup';
import ControlLabel from 'modules/common/components/form/Label';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { generateButtonStart } from '../../utils';

type Props = {
  startDate: Date;
  reminderMinute: number;
  onChangeField: (
    name: 'startDate' | 'reminderMinute' | 'isComplete',
    value: any
  ) => void;
};

type State = {
  startDate: Date;
};

class StartDate extends React.Component<Props, State> {
  private ref;
  private overlay: any;

  constructor(props) {
    super(props);

    this.ref = React.createRef();

    this.state = {
      startDate: props.startDate || dayjs()
    };
  }

  setOverlay = overlay => {
    this.overlay = overlay;
  };

  dateOnChange = date => {
    this.setState({ startDate: date });
  };

  hideContent = () => {
    this.overlay.hide();
  };

  onSave = () => {
    const { startDate } = this.state;

    this.props.onChangeField('startDate', startDate);
    this.hideContent();
  };

  remove = () => {
    this.props.onChangeField('startDate', null);
    this.hideContent();
  };

  renderContent() {
    const { startDate } = this.state;

    const day = dayjs(startDate).format('YYYY/MM/DD');
    const time = dayjs(startDate).format('HH:mm');

    return (
      <Popover id="pipeline-popover">
        <CloseDateContent>
          {startDate && (
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
              value={startDate}
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
    const { startDate } = this.props;
    const time = dayjs(startDate).format('HH:mm');

    const trigger = (
      <Button colorName={generateButtonStart(startDate)}>
        {startDate
          ? `${dayjs(startDate).format('MMM DD')} at ${time}`
          : 'Start date'}
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
          <div>{trigger}</div>
        </OverlayTrigger>
      </CloseDateWrapper>
    );
  }
}

export default StartDate;
