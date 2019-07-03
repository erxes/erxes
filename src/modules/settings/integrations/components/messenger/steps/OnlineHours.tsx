import {
  Button,
  ControlLabel,
  FormGroup,
  Icon
} from 'modules/common/components';
import { days, hours } from 'modules/settings/integrations/constants';
import { FlexRow } from 'modules/settings/integrations/styles';
import React from 'react';
import Select from 'react-select-plus';
import { IOnlineHour } from '../../../types';

type Props = {
  prevOptions: any[];
  onChange: (onlineHours: IOnlineHour[]) => void;
};

type State = {
  onlineHours: IOnlineHour[];
};

class OnlineHours extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { onlineHours: props.prevOptions || [] };
  }

  onTimeItemChange(onlineHourId, name, value) {
    const onlineHours = this.state.onlineHours;

    // find current editing one
    const onlineHour =
      onlineHours.find(hour => hour._id === onlineHourId) || [];

    // set new value
    onlineHour[name] = value;

    this.setState({ onlineHours });

    // notify as change to main component
    this.props.onChange(onlineHours);
  }

  addTime = () => {
    const onlineHours = this.state.onlineHours.slice();

    onlineHours.push({
      _id: Math.random().toString(),
      day: days[0].value,
      from: hours[0].value,
      to: hours[0].value
    });

    this.setState({ onlineHours });

    // notify as change to main component
    this.props.onChange(onlineHours);
  };

  removeTime = onlineHourId => {
    let onlineHours = this.state.onlineHours;

    onlineHours = onlineHours.filter(hour => hour._id !== onlineHourId);

    this.setState({ onlineHours });

    // notify as change to main component
    this.props.onChange(onlineHours);
  };

  renderOnlineHour(onlineHour) {
    const remove = () => {
      this.removeTime(onlineHour._id);
    };

    const onDayChange = e => {
      this.onTimeItemChange(onlineHour._id, 'day', e.value);
    };

    const onFromChange = e => {
      this.onTimeItemChange(onlineHour._id, 'from', e.value);
    };

    const onToChange = e => {
      this.onTimeItemChange(onlineHour._id, 'to', e.value);
    };

    const { _id, day, from, to } = onlineHour;
    return (
      <FlexRow key={_id}>
        <Select
          className="flex-item"
          value={day}
          options={days}
          onChange={onDayChange}
          clearable={false}
        />

        <span>from</span>
        <Select
          className="flex-item"
          onChange={onFromChange}
          value={from}
          options={hours}
          clearable={false}
        />

        <span>to</span>
        <Select
          className="flex-item"
          onChange={onToChange}
          value={to}
          options={hours}
          clearable={false}
        />

        <Button size="small" btnStyle="danger" onClick={remove}>
          <Icon icon="cancel-1" />
        </Button>
      </FlexRow>
    );
  }

  render() {
    return (
      <FormGroup>
        <ControlLabel>Online hours</ControlLabel>

        {this.state.onlineHours.map(onlineHour =>
          this.renderOnlineHour(onlineHour)
        )}

        <br />
        <Button
          btnStyle="success"
          size="small"
          onClick={this.addTime}
          icon="add"
        >
          Add another time
        </Button>
      </FormGroup>
    );
  }
}

export default OnlineHours;
