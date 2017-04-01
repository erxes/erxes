import React, { PropTypes, Component } from 'react';
import { FormGroup, ControlLabel } from 'react-bootstrap';
import { days, hours } from '../constants';

class OnlineHours extends Component {
  constructor(props) {
    super(props);

    this.state = { onlineHours: props.prevOptions || [] };

    this.addTime = this.addTime.bind(this);
    this.removeTime = this.removeTime.bind(this);
  }

  onTimeItemChange(onlineHourId, name, value) {
    const onlineHours = this.state.onlineHours;

    // find current editing one
    const onlineHour = onlineHours.find(hour => hour._id === onlineHourId);

    // set new value
    onlineHour[name] = value;

    this.setState({ onlineHours });

    // notify as change to main component
    this.props.onChange(onlineHours);
  }

  addTime() {
    const onlineHours = this.state.onlineHours;

    onlineHours.push({
      _id: Math.random().toString(),
      day: days[0].value,
      from: hours[0].value,
      to: hours[0].value,
    });

    this.setState({ onlineHours });

    // notify as change to main component
    this.props.onChange(onlineHours);
  }

  removeTime(onlineHourId) {
    let onlineHours = this.state.onlineHours;

    onlineHours = onlineHours.filter(hour => hour._id !== onlineHourId);

    this.setState({ onlineHours });

    // notify as change to main component
    this.props.onChange(onlineHours);
  }

  renderOnlineHour(onlineHour) {
    const remove = () => {
      this.removeTime(onlineHour._id);
    };

    const onDayChange = (e) => {
      this.onTimeItemChange(onlineHour._id, 'day', e.target.value);
    };

    const onFromChange = (e) => {
      this.onTimeItemChange(onlineHour._id, 'from', e.target.value);
    };

    const onToChange = (e) => {
      this.onTimeItemChange(onlineHour._id, 'to', e.target.value);
    };

    const { _id, day, from, to } = onlineHour;

    return (
      <div key={_id}>
        <select onChange={onDayChange} value={day}>
          {days.map((d, index) =>
            <option key={index} value={d.value}>{d.text}</option>,
          )}
        </select>

        from

        <select onChange={onFromChange} value={from}>
          {hours.map((h, index) =>
            <option key={index} value={h.value}>{h.text}</option>,
          )}
        </select>

        to

        <select onChange={onToChange} value={to}>
          {hours.map((h, index) =>
            <option key={index} value={h.value}>{h.text}</option>,
          )}
        </select>

        <button
          type="button"
          className="btn btn-xs btn-danger"
          onClick={remove}
        >
          <i className="ion-close-circled" />
        </button>
      </div>
    );
  }

  render() {
    return (
      <FormGroup>
        <ControlLabel>Online hours</ControlLabel>

        {this.state.onlineHours.map(onlineHour =>
          this.renderOnlineHour(onlineHour),
        )}

        <button
          type="button"
          className="btn btn-xs btn-success"
          onClick={this.addTime}
        >
          Add time
        </button>
      </FormGroup>
    );
  }
}

OnlineHours.propTypes = {
  prevOptions: PropTypes.array, // eslint-disable-line
  onChange: PropTypes.func.isRequired,
};

export default OnlineHours;
