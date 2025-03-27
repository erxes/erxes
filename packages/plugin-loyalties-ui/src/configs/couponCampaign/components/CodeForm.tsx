import { ControlLabel, FormControl, FormGroup } from '@erxes/ui/src/components';
import { TabTitle, Tabs } from '@erxes/ui/src/components/tabs';
import { FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';
import { IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import Select from 'react-select';
import { CHARACTER_SET_OPTIONS } from '../constants';
import { IConfig } from '../types';

type Props = {
  codeRule: IConfig;
  queryParams: any;
  formProps: IFormProps;
  onChange: (rule: IConfig) => void;
};

const Form = (props: Props) => {
  const { codeRule, formProps, onChange } = props;

  const [currentTab, setCurrentTab] = useState('default');

  const handleChange = (e) => {
    const name = e.target.name;
    let value = e.target.value;

    if (e.target.type === 'number') {
      value = Number(value);
    }

    onChange({
      ...codeRule,
      [name]: value || undefined,
    });
  };

  const handleSelect = (selectedOptions, actionMeta) => {
    const name = actionMeta.name;
    const values = (selectedOptions || []).map(
      (selectedOption) => selectedOption.value,
    );

    onChange({
      ...codeRule,
      [name]: values || undefined,
    });
  };

  const renderCommonFields = (formProps) => {
    return (
      <FormWrapper>
        <FormColumn>
          <FormGroup>
            <ControlLabel>Usage Limit</ControlLabel>
            <FormControl
              {...formProps}
              name="usageLimit"
              type="number"
              min={1}
              value={codeRule.usageLimit || 1}
              onChange={handleChange}
            />
          </FormGroup>
        </FormColumn>

        <FormColumn>
          <FormGroup>
            <ControlLabel>Redemption Limit Per User</ControlLabel>
            <FormControl
              name="redemptionLimitPerUser"
              type="number"
              min={1}
              value={codeRule.redemptionLimitPerUser || 1}
              onChange={handleChange}
            />
          </FormGroup>
        </FormColumn>
      </FormWrapper>
    );
  };

  const renderAdvancedFields = (formProps) => {
    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Prefix (UpperCase)</ControlLabel>
              <FormControl
                {...formProps}
                name="prefix"
                componentclass="input"
                placeholder="Text prepended before the code"
                value={codeRule.prefix}
                onChange={handleChange}
              />
            </FormGroup>
          </FormColumn>

          <FormColumn>
            <FormGroup>
              <ControlLabel>Postfix (UpperCase)</ControlLabel>
              <FormControl
                {...formProps}
                name="postfix"
                componentclass="input"
                placeholder="Text appended after the code"
                value={codeRule.postfix}
                onChange={handleChange}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        <FormGroup>
          <ControlLabel>Character set</ControlLabel>
          <Select
            name="charSet"
            options={CHARACTER_SET_OPTIONS}
            isMulti
            isClearable
            placeholder="Characters that can appear in the code"
            onChange={handleSelect}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Pattern</ControlLabel>
          <FormControl
            name="pattern"
            componentclass="input"
            placeholder="Hashes (#) are replaced with random characters"
            value={codeRule.pattern}
            onChange={handleChange}
          />
        </FormGroup>
      </>
    );
  };

  const renderDefaultContent = (formProps) => {
    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel>Code length</ControlLabel>
              <FormControl
                {...formProps}
                name="codeLength"
                type="number"
                min={6}
                value={codeRule.codeLength || 10}
                onChange={handleChange}
              />
            </FormGroup>
          </FormColumn>

          <FormColumn>
            <FormGroup>
              <ControlLabel>Number of codes</ControlLabel>
              <FormControl
                {...formProps}
                name="size"
                type="number"
                min={1}
                value={codeRule.size || 1}
                onChange={handleChange}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>

        {renderAdvancedFields(formProps)}

        {renderCommonFields(formProps)}
      </>
    );
  };

  const renderStaticContent = (formProps) => {
    return (
      <>
        <FormGroup>
          <ControlLabel>Code</ControlLabel>
          <FormControl
            {...formProps}
            name="staticCode"
            componentclass="input"
            placeholder="Enter the coupon code here"
            value={codeRule.staticCode}
            onChange={handleChange}
          />
        </FormGroup>
        {renderCommonFields(formProps)}
      </>
    );
  };

  const renderTabContent = (formProps) => {
    if (['', 'default'].includes(currentTab)) {
      return renderDefaultContent(formProps);
    }

    if ('static' === currentTab) {
      return renderStaticContent(formProps);
    }
  };

  return (
    <>
      <Tabs full={true}>
        <TabTitle
          onClick={() => setCurrentTab('default')}
          className={['', 'default'].includes(currentTab) ? 'active' : ''}
        >
          {__('Default')}
        </TabTitle>
        <TabTitle
          onClick={() => setCurrentTab('static')}
          className={currentTab === 'static' ? 'active' : ''}
        >
          {'Static'}
        </TabTitle>
      </Tabs>
      <br />
      {renderTabContent(formProps)}
    </>
  );
};

export default Form;
