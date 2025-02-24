import Button from '@erxes/ui/src/components/Button';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import {
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
} from '@erxes/ui/src/styles/eindex';
import { IFormProps } from '@erxes/ui/src/types';
import { __ } from 'coreui/utils';
import React, { useState } from 'react';
import { IContract, IStepRules } from '../../types';
import FormControl from '@erxes/ui/src/components/form/Control';
import { DateContainer } from '@erxes/ui/src/styles/main';
import DateControl from '@erxes/ui/src/components/form/DateControl';

type Props = {
  stepRules?: IStepRules[];
  setStepRules: (stepRules) => void;
};

function StepRulesForm(props: Props) {
  const { stepRules } = props;

  const renderFormGroup = (label, props) => {
    if (!label) return <FormControl {...props} />;
    return (
      <FormGroup>
        <ControlLabel required={props.required}>{__(label)}</ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  };

  const renderStepRuleForm = (formProps) => {
    return (
      <FormWrapper>
        {(stepRules || []).map((stepRule) => {
          return (
            <>
              <FormColumn>
                <FormGroup>
                  <ControlLabel required={true}>
                    {__('First Pay Date')}
                  </ControlLabel>
                  <DateContainer>
                    <DateControl
                      {...formProps}
                      required={false}
                      name="firstPayDate"
                      dateFormat="YYYY/MM/DD"
                      value={stepRule.firstPayDate}
                      // onChange={onChangeStartDate}
                    />
                  </DateContainer>
                </FormGroup>

                {renderFormGroup('Tenor', {
                  ...formProps,
                  name: 'tenor',
                  type: 'number',
                  value: stepRule.tenor || 0,
                  // onChange: (e) =>
                  //   setContract({
                  //     ...stepRule,
                  //     interestRate: (e.target as any).value * 12,
                  //   }),
                })}

                {renderFormGroup('Schedule Days', {
                  ...formProps,
                  name: 'scheduleDays',
                  type: 'number',
                  value: stepRule.scheduleDays || 0,
                  // onChange: (e) =>
                  //   setContract({
                  //     ...stepRule,
                  //     interestRate: (e.target as any).value * 12,
                  //   }),
                })}
              </FormColumn>

              <FormColumn>
                {renderFormGroup('InterestRate', {
                  ...formProps,
                  name: 'interestRate',
                  type: 'number',
                  value: stepRule.interestRate || 0,
                  // onChange: (e) =>
                  //   setContract({
                  //     ...stepRule,
                  //     interestRate: (e.target as any).value * 12,
                  //   }),
                })}

                {renderFormGroup('Main Pay Per Month', {
                  ...formProps,
                  name: 'mainPayPerMonth',
                  type: 'number',
                  value: stepRule.mainPayPerMonth || 0,
                  // onChange: (e) =>
                  //   setContract({
                  //     ...stepRule,
                  //     interestRate: (e.target as any).value * 12,
                  //   }),
                })}

                {renderFormGroup('Total Main Amount', {
                  ...formProps,
                  name: 'totalMainAmount',
                  type: 'number',
                  value: stepRule.totalMainAmount || 0,
                  // onChange: (e) =>
                  //   setContract({
                  //     ...stepRule,
                  //     interestRate: (e.target as any).value * 12,
                  //   }),
                })}

                {renderFormGroup('Salvage Amount', {
                  ...formProps,
                  name: 'salvageAmount',
                  type: 'number',
                  value: stepRule.salvageAmount || 0,
                  // onChange: (e) =>
                  //   setContract({
                  //     ...stepRule,
                  //     interestRate: (e.target as any).value * 12,
                  //   }),
                })}
              </FormColumn>

              <FormColumn>
                {renderFormGroup('Skip Interest Calc Month', {
                  ...formProps,
                  name: 'skipInterestCalcMonth',
                  type: 'number',
                  value: stepRule.skipInterestCalcMonth || 0,
                  // onChange: (e) =>
                  //   setContract({
                  //     ...stepRule,
                  //     interestRate: (e.target as any).value * 12,
                  //   }),
                })}

                {renderFormGroup('Skip Interest Calc Day', {
                  ...formProps,
                  name: 'skipInterestCalcDay',
                  type: 'number',
                  value: stepRule.skipInterestCalcDay || 0,
                  // onChange: (e) =>
                  //   setContract({
                  //     ...stepRule,
                  //     interestRate: (e.target as any).value * 12,
                  //   }),
                })}

                {renderFormGroup('Skip Amount Calc Month', {
                  ...formProps,
                  name: 'skipAmountCalcMonth',
                  type: 'number',
                  value: stepRule.skipAmountCalcMonth || 0,
                  // onChange: (e) =>
                  //   setContract({
                  //     ...stepRule,
                  //     interestRate: (e.target as any).value * 12,
                  //   }),
                })}

                {renderFormGroup('skipAmountCalcDay', {
                  ...formProps,
                  name: 'skipAmountCalcDay',
                  type: 'number',
                  value: stepRule.skipAmountCalcDay || 0,
                  // onChange: (e) =>
                  //   setContract({
                  //     ...stepRule,
                  //     interestRate: (e.target as any).value * 12,
                  //   }),
                })}
              </FormColumn>
            </>
          );
        })}
      </FormWrapper>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        {/* onClick={() => onChangeFeature()} */}
        <FormGroup>
          <ControlLabel>Step Rules</ControlLabel>
          <Button size="small">+ Add Step Rules</Button>
        </FormGroup>

        {renderStepRuleForm(formProps)}
      </>
    );
  };

  return <Form renderContent={renderContent} />;
}

export default StepRulesForm;
