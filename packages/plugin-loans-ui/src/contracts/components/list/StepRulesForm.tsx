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
import React from 'react';
import { IStepRules } from '../../types';
import FormControl from '@erxes/ui/src/components/form/Control';
import { DateContainer } from '@erxes/ui/src/styles/main';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import Select from 'react-select';

const getEmptyRules = () => ({
  _id: crypto.randomUUID(),
  scheduleDays: [],
  tenor: '',
  interestRate: '',
  firstPayDate: '',
  mainPayPerMonth: '',
  totalMainAmount: '',
  salvageAmount: '',
  skipInterestCalcMonth: '',
  skipInterestCalcDay: '',
  skipAmountCalcMonth: '',
  skipAmountCalcDay: '',
});

type Props = {
  stepRules: IStepRules[];
  setStepRules: (stepRules) => void;
};

function StepRulesForm(props: Props) {
  const { stepRules, setStepRules } = props;

  const renderFormGroup = (label, props) => {
    if (!label) return <FormControl {...props} />;
    return (
      <FormGroup>
        <ControlLabel required={props.required}>{__(label)}</ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  };

  const onChangeItem = (_id: string, key: string, value: any) => {
    setStepRules((prev) =>
      prev.map((rule) => (rule._id === _id ? { ...rule, [key]: value } : rule))
    );
  };

  const onSelectScheduleDays = (_id: string, key: string, value: any) => {
    const updatedRules = updateStepRules(_id, key, value);
    setStepRules(updatedRules);
  };

  const updateStepRules = (_id: string, key: string, value: any) => {
    return stepRules.map((rule) => updateRule(rule, _id, key, value));
  };

  const updateRule = (rule: any, _id: string, key: string, value: any) => {
    if (rule._id === _id) {
      return { ...rule, [key]: value.map((val: any) => val.value) };
    }
    return rule;
  };

  const onChangeDate = (_id: string, key: string, date: any) => {
    setStepRules((prev) =>
      prev.map((rule) => (rule._id === _id ? { ...rule, [key]: date } : rule))
    );
  };

  const onChangeFeature = () => {
    setStepRules([...stepRules, getEmptyRules()]);
  };

  const removeFeature = (_id?: string) => {
    const modifiedStepRules = stepRules.filter((f) => f._id !== _id);

    setStepRules(modifiedStepRules);
  };

  const scheduleOptions = new Array(31).fill(1).map((row, index) => ({
    value: row + index,
    label: row + index,
  }));

  const renderStepRuleForm = (formProps) => {
    return (
      <>
        {(stepRules || []).map((stepRule) => {
          return (
            <FormWrapper key={stepRule._id}>
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
                      onChange={(e: any) =>
                        onChangeDate(stepRule._id, 'firstPayDate', e.getTime())
                      }
                    />
                  </DateContainer>
                </FormGroup>

                {renderFormGroup('Tenor', {
                  ...formProps,
                  name: 'tenor',
                  type: 'number',
                  value: stepRule.tenor,
                  onChange: (e) =>
                    onChangeItem(stepRule._id, 'tenor', Number(e.target.value)),
                })}

                <FormGroup>
                  <ControlLabel required>{__('Schedule Days')}</ControlLabel>
                  <Select
                    className="flex-item"
                    placeholder={__('Choose an schedule Days')}
                    value={scheduleOptions.filter((o) =>
                      stepRule.scheduleDays?.includes(o.value)
                    )}
                    onChange={(item: any) =>
                      onSelectScheduleDays(stepRule._id, 'scheduleDays', item)
                    }
                    isMulti={true}
                    options={scheduleOptions}
                  />
                </FormGroup>
              </FormColumn>

              <FormColumn>
                {renderFormGroup('InterestRate', {
                  ...formProps,
                  name: 'interestRate',
                  type: 'number',
                  value: stepRule.interestRate,
                  onChange: (e) =>
                    onChangeItem(
                      stepRule._id,
                      'interestRate',
                      Number(e.target.value)
                    ),
                })}

                {renderFormGroup('Main Pay Per Month', {
                  ...formProps,
                  name: 'mainPayPerMonth',
                  type: 'number',
                  value: stepRule.mainPayPerMonth,
                  onChange: (e) =>
                    onChangeItem(
                      stepRule._id,
                      'mainPayPerMonth',
                      Number(e.target.value)
                    ),
                })}

                {renderFormGroup('Total Main Amount', {
                  ...formProps,
                  name: 'totalMainAmount',
                  type: 'number',
                  value: stepRule.totalMainAmount,
                  onChange: (e) =>
                    onChangeItem(
                      stepRule._id,
                      'totalMainAmount',
                      Number(e.target.value)
                    ),
                })}

                {renderFormGroup('Salvage Amount', {
                  ...formProps,
                  name: 'salvageAmount',
                  type: 'number',
                  value: stepRule.salvageAmount,
                  onChange: (e) =>
                    onChangeItem(
                      stepRule._id,
                      'salvageAmount',
                      Number(e.target.value)
                    ),
                })}
              </FormColumn>

              <FormColumn>
                {renderFormGroup('Skip Interest Calc Month', {
                  ...formProps,
                  name: 'skipInterestCalcMonth',
                  type: 'number',
                  value: stepRule.skipInterestCalcMonth,
                  onChange: (e) =>
                    onChangeItem(
                      stepRule._id,
                      'skipInterestCalcMonth',
                      Number(e.target.value)
                    ),
                })}

                {renderFormGroup('Skip Interest Calc Day', {
                  ...formProps,
                  name: 'skipInterestCalcDay',
                  type: 'number',
                  value: stepRule.skipInterestCalcDay,
                  onChange: (e) =>
                    onChangeItem(
                      stepRule._id,
                      'skipInterestCalcDay',
                      Number(e.target.value)
                    ),
                })}

                {renderFormGroup('Skip Amount Calc Month', {
                  ...formProps,
                  name: 'skipAmountCalcMonth',
                  type: 'number',
                  value: stepRule.skipAmountCalcMonth,
                  onChange: (e) =>
                    onChangeItem(
                      stepRule._id,
                      'skipAmountCalcMonth',
                      Number(e.target.value)
                    ),
                })}

                {renderFormGroup('skipAmountCalcDay', {
                  ...formProps,
                  name: 'skipAmountCalcDay',
                  type: 'number',
                  value: stepRule.skipAmountCalcDay,
                  onChange: (e) =>
                    onChangeItem(
                      stepRule._id,
                      'skipAmountCalcDay',
                      Number(e.target.value)
                    ),
                })}
                <Button
                  btnStyle="danger"
                  size="small"
                  onClick={() => removeFeature(stepRule._id)}
                >
                  X Remove Step Rule
                </Button>
              </FormColumn>
            </FormWrapper>
          );
        })}
      </>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    return (
      <>
        <FormGroup>
          <ControlLabel>Step Rules</ControlLabel>
          <Button size="small" onClick={() => onChangeFeature()}>
            + Add Step Rules
          </Button>
        </FormGroup>

        {renderStepRuleForm(formProps)}
      </>
    );
  };

  return <Form renderContent={renderContent} />;
}

export default StepRulesForm;
