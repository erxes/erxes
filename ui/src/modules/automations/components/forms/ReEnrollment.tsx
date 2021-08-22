import React from 'react';
import {
  EnrollmentWrapper,
  StyledToggle,
  Checkbox
} from 'modules/automations/styles';
import Toggle from 'modules/common/components/Toggle';
import { __ } from 'modules/common/utils';
import FormControl from 'modules/common/components/form/Control';
import { ENROLLS } from 'modules/automations/constants';
import { ITrigger } from 'modules/automations/types';

type Props = {
  trigger: ITrigger;
};

type State = {
  reEnroll: boolean;
  checked: string[];
};

class ReEnrollment extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      reEnroll: false,
      checked: []
    };
  }

  onSwitchHandler = e => {
    this.setState({ reEnroll: e.target.checked });
  };

  onChangeCheckbox = e => {
    console.log(e.target.value);
  };

  render() {
    const { reEnroll } = this.state;

    return (
      <EnrollmentWrapper>
        <EnrollmentWrapper>
          <span>
            <b>{__('Re-enrollment')}</b>
            <p>
              {__(
                'This will allow you that meet the trigger criteria to re-enroll'
              )}
              .
            </p>
          </span>
          <StyledToggle>
            <Toggle
              checked={reEnroll}
              onChange={this.onSwitchHandler}
              icons={{
                checked: <span>Yes</span>,
                unchecked: <span>No</span>
              }}
            />
          </StyledToggle>
        </EnrollmentWrapper>
        <p>
          {__(
            'Re-enroll deal if they meet the trigger criteria and any of the following occurs'
          )}
          :
        </p>
        <Checkbox>
          {ENROLLS.map(enroll => (
            <FormControl
              key={enroll.id}
              componentClass="checkbox"
              onChange={this.onChangeCheckbox}
              value={enroll.id}
            >
              {enroll.label}
            </FormControl>
          ))}
        </Checkbox>
      </EnrollmentWrapper>
    );
  }
}

export default ReEnrollment;
