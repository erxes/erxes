import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { FlexItem, LeftItem } from 'modules/common/components/step/styles';
import timezones from 'modules/common/constants/timezones';
import React from 'react';

type NameInput = 'timezone';

type Props = {
  onChange: (name: NameInput, value: string) => void;
  timezone?: string;
};

type State = {
  timezone?: string;
};

class OpeningHours extends React.Component<Props, State> {
  onChangeInput = (name: NameInput, e: React.FormEvent) => {
    const { value } = e.target as HTMLInputElement;

    this.setState({ [name]: value }, () => this.props.onChange(name, value));
  };

  render() {
    const { timezone } = this.props;

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
        </LeftItem>
      </FlexItem>
    );
  }
}

export default OpeningHours;
