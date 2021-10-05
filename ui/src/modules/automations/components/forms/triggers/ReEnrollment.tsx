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
import { FieldsCombinedByType } from 'modules/settings/properties/types';

export type ReEnrollmentRule = {
  property: string;
  description?: string;
};

type Props = {
  trigger: ITrigger;
  segment?: ISegment;
  fields: FieldsCombinedByType[];
  closeModal?: () => void;
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
    const { config = {} } = trigger;

    this.state = {
      reEnroll: config.reEnrollment ? true : false,
      checked: config.reEnrollmentRules || []
    };
  }

  onChangeConfig = () => {
    const { reEnroll, checked } = this.state;
    const { trigger, addConfig } = this.props;

    const config = {
      reEnrollment: reEnroll,
      reEnrollmentRules: checked
    };

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
    const { fields } = this.props;
    const { checked, reEnroll } = this.state;

    let labelByName = {};

    for (const cond of condition.conditions) {
      const field = fields.find(f => f.name === cond.propertyName) || {
        label: ''
      };
      labelByName[cond.propertyName] = field.label || cond.propertyName;
    }

    return Object.keys(labelByName).map(propertyName => (
      <FormControl
        key={Math.random()}
        componentClass="checkbox"
        onChange={this.onChangeCheckbox}
        checked={reEnroll ? checked.includes(propertyName) : false}
        value={`${propertyName}`}
        disabled={reEnroll ? false : true}
      >
        {`${labelByName[propertyName]}`}
      </FormControl>
    ));
  };

  renderForm = (formProps: IFormProps) => {
    const { reEnroll } = this.state;
    const { segment } = this.props;

    if (!segment) {
      return __('Must segment form save');
    }

    return (
      <>
        <EnrollmentWrapper noMargin={true}>
          <b>{__('Re-enrollment')}</b>
          <div>
            <p>
              {__(
                'This will allow you that meet the trigger criteria to re-enroll'
              )}
              .
            </p>
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
          </div>
        </EnrollmentWrapper>
        <p>
          {__(
            'Re-enroll deal if they meet the trigger criteria and any of the following occurs'
          )}
          :
        </p>
        <Checkbox>
          {segment.subSegmentConditions.map(cond => this.renderCheckbox(cond))}
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
