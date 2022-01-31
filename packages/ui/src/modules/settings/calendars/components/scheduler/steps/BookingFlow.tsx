import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { FlexItem, LeftItem } from 'modules/common/components/step/styles';
import React from 'react';

type Props = {
  onChange: (name: 'confirmationMethod', value: string) => void;
  confirmationMethod?: string;
};

class BookingFlow extends React.Component<Props> {
  onChangeFunction = (name, value) => {
    this.setState({ [name]: value });
    this.props.onChange(name, value);
  };

  render() {
    const onChange = e =>
      this.onChangeFunction(
        'confirmationMethod',
        (e.currentTarget as HTMLInputElement).value
      );

    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <ControlLabel>How should new bookings be handled?</ControlLabel>

            <br />
            <br />
            <FormControl
              value="automatic"
              componentClass="radio"
              checked={this.props.confirmationMethod === 'automatic'}
              onChange={onChange}
            >
              Automatic
              <br />
              Bookings are auto-confirmed when they are submitted (instant
              booking)
            </FormControl>

            <br />
            <br />
            <FormControl
              value="manual"
              componentClass="radio"
              checked={this.props.confirmationMethod === 'manual'}
              onChange={onChange}
            >
              Manual
              <br />
              You'll be notified and can confirm or decline bookings manually
            </FormControl>
          </FormGroup>
        </LeftItem>
      </FlexItem>
    );
  }
}

export default BookingFlow;
