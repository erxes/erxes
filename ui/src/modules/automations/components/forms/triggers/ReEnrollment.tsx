import {
  Checkbox,
  EnrollmentWrapper,
  StyledToggle
} from 'modules/automations/styles';
import CommonForm from 'modules/common/components/form/Form';
import { ITrigger } from 'modules/automations/types';
import FormControl from 'modules/common/components/form/Control';
import Toggle from 'modules/common/components/Toggle';
import { IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { ISegment } from 'modules/segments/types';
import React from 'react';

export type ReEnrollmentRule = {
  property: string;
  description?: string;
};

type Props = {
  trigger: ITrigger;
  segment: ISegment;
  closeModal?: () => void;
  // renderButton: (props: IButtonMutateProps) => JSX.Element;
  afterSave?: () => void;
  addConfig: (trigger: ITrigger, id?: string, config?: any) => void;
};

type State = {
  reEnroll: boolean;
  checked: string[];
};

class ReEnrollment extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { trigger } = this.props;

    this.state = {
      reEnroll: trigger.config.reEnrollment ? true : false,
      checked: trigger.config.reEnrollmentRules || []
    };
  }

  onChangeConfig = () => {
    const { reEnroll, checked } = this.state;
    const { trigger, addConfig } = this.props;
    const config = {
      reEnrollment: reEnroll,
      reEnrollmentRules: checked
    };

    console.log(config, 'dddddddddddddd');

    addConfig(trigger, trigger.id, config);
  };

  onSwitchHandler = e => {
    this.setState({ reEnroll: e.target.checked }, () => {
      this.onChangeConfig();
    });
  };

  onChangeCheckbox = e => {
    const property = e.target.value;
    const isCheck = e.target.checked;
    const { checked } = this.state;
    let updated: string[] = [];

    if (isCheck) {
      updated = [...checked, property];
    } else {
      updated = checked.filter(ch => ch !== property);
    }

    this.setState({ checked: updated }, () => {
      this.onChangeConfig();
    });
  };

  renderCheckbox = condition => {
    const { checked, reEnroll } = this.state;
    return condition.conditions.map(cond => (
      <FormControl
        key={cond.key}
        componentClass="checkbox"
        onChange={this.onChangeCheckbox}
        checked={reEnroll ? checked.includes(cond.propertyName) : false}
        value={`${cond.propertyName}`}
        disabled={reEnroll ? false : true}
      >
        {`${cond.propertyName} ${cond.propertyOperator} ${cond.propertyValue}`}
      </FormControl>
    ));
  };

  renderForm = (formProps: IFormProps) => {
    const { reEnroll } = this.state;
    const { segment } = this.props;

    return (
      <>
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
          {segment.getConditionSegments.map(cond => this.renderCheckbox(cond))}
        </Checkbox>
      </>
    );
  };

  render() {
    return (
      <EnrollmentWrapper>
        <CommonForm renderContent={this.renderForm} />
      </EnrollmentWrapper>
    );
  }
}

export default ReEnrollment;
