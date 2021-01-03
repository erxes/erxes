import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { FlexItem, LeftItem } from 'modules/common/components/step/styles';
import timezones from 'modules/common/constants/timezones';
import { FlexRow } from 'modules/settings/integrations/styles';
import React from 'react';
import styled from 'styled-components';

const WeekContainers = styled.div`
  display: inline-block;
  button {
    background-color: #fff;
    border: 1px solid #eee;
    cursor: pointer;
    margin: 0;

    &.checked {
      background-color: #9900ef;
      color: #fff;
    }
  }
`;

type Props = {
  onChange: (name: 'timezone' | 'openingHours', value: any) => void;
  timezone?: string;
};

type State = {
  timezone?: string;
  days: string[];
  startDate: Date;
  endDate: Date;
};

class OpeningHours extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const defaultTime = (time: number) => {
      return new Date(
        dayjs()
          .startOf('day')
          .add(time, 'hour')
          .format('YYYY-MM-DD HH:mm')
      );
    };
    this.state = {
      days: ['M', 'T', 'W', 'R', 'F'],
      startDate: defaultTime(9),
      endDate: defaultTime(17)
    };
  }

  onChangeInput = (name: 'timezone', e: React.FormEvent) => {
    const { value } = e.target as HTMLInputElement;

    this.setState({ [name]: value }, () => this.props.onChange(name, value));
  };

  generateOpeningHours = () => {
    const { days, startDate, endDate } = this.state;

    return [
      {
        days,
        start: dayjs(startDate).format('HH:mm'),
        end: dayjs(endDate).format('HH:mm')
      }
    ];
  };

  updateOpeningHours = () => {
    this.props.onChange('openingHours', this.generateOpeningHours());
  };

  onChangeDays = (value: string) => {
    const { days } = this.state;

    if (days.includes(value)) {
      const index = days.indexOf(value);

      days.splice(index, 1);
    } else {
      days.push(value);
    }

    this.setState({ days }, () => this.updateOpeningHours());
  };

  onChangeStartDate = time => {
    this.setState({ startDate: time }, () => this.updateOpeningHours());
  };

  onChangeEndDate = time => {
    this.setState({ endDate: time }, () => this.updateOpeningHours());
  };

  render() {
    const { timezone } = this.props;

    const weeks = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const weekValues = ['U', 'M', 'T', 'W', 'R', 'F', 'S'];

    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <ControlLabel>What is the event time zone?</ControlLabel>
            Time zone for opening hours and new events. Your invitees will see
            your availability in their local time zone.
            <br />
            <FormControl
              componentClass="select"
              defaultValue={timezone}
              name="timezone"
              options={timezones}
              onChange={this.onChangeInput.bind(null, 'timezone')}
            />
          </FormGroup>

          <FlexRow>
            <div className="flex-item">
              <WeekContainers>
                {weeks.map((k, index) => {
                  const value = weekValues[index];
                  const isChecked = this.state.days.includes(value);

                  return (
                    <button
                      key={index}
                      value={weekValues[index]}
                      className={isChecked ? 'checked' : ''}
                      onClick={this.onChangeDays.bind(this, value)}
                    >
                      {k}
                    </button>
                  );
                })}
              </WeekContainers>
            </div>
            <div className="flex-item">
              <ControlLabel>Start Time</ControlLabel>

              <Datetime
                dateFormat={false}
                timeFormat="HH:mm"
                closeOnSelect={true}
                utc={true}
                input={false}
                value={this.state.startDate}
                onChange={this.onChangeStartDate}
              />
            </div>

            <div className="flex-item">
              <ControlLabel>End Time</ControlLabel>

              <Datetime
                dateFormat={false}
                timeFormat="HH:mm"
                closeOnSelect={true}
                utc={true}
                input={false}
                value={this.state.endDate}
                onChange={this.onChangeEndDate}
              />
            </div>
          </FlexRow>
        </LeftItem>
      </FlexItem>
    );
  }
}

export default OpeningHours;
