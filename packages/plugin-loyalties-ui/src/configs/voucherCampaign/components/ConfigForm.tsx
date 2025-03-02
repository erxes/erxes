import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
} from '@erxes/ui/src/components';
import { TabTitle, Tabs } from '@erxes/ui/src/components/tabs';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import React, { useState } from 'react';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type Config = {
  prefix?: string;
  suffix?: string;
  codeLength: number;
  usageLimit?: number;
  quantity: number;
  allowRepeatRedemption: boolean;
  staticCode: string;
};

const ConfigForm = (props: Props) => {
  const { renderButton, closeModal } = props;

  const [currentTab, setCurrentTab] = useState('default');

  const [config, setConfig] = useState<Config>({
    prefix: '',
    suffix: '',
    codeLength: 10,
    usageLimit: 1,
    quantity: 1,
    allowRepeatRedemption: false,
    staticCode: '',
  });

  const generateDoc = () => {
    return { ...config };
  };

  const handleChange = (e) => {
    const name = e.target.name;

    if (e.target.type === 'checkbox') {
      return setConfig((prevConfig) => ({
        ...prevConfig,
        [name]: !prevConfig[name],
      }));
    }

    let value = e.target.value;

    if (e.target.type === 'number') {
      value = Number(value);
    }

    setConfig((prevConfig) => ({
      ...prevConfig,
      [name]: value,
    }));
  };

  const renderCommonFields = (formProps) => {
    return (
      <>
        <FormGroup>
          <ControlLabel>Usage Limit</ControlLabel>
          <FormControl
            {...formProps}
            name="usageLimit"
            type="number"
            min={1}
            value={config.usageLimit}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Allow Repeat Redemption</ControlLabel>
          <FormControl
            name="allowRepeatRedemption"
            type="checkbox"
            componentclass="checkbox"
            checked={config.allowRepeatRedemption}
            onChange={handleChange}
          />
        </FormGroup>
      </>
    );
  };

  const renderDefaultContent = (formProps) => {
    return (
      <>
        <FormGroup>
          <ControlLabel>Prefix</ControlLabel>
          <FormControl
            {...formProps}
            name="prefix"
            componentclass="input"
            value={config.prefix}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Suffix</ControlLabel>
          <FormControl
            {...formProps}
            name="suffix"
            componentclass="input"
            value={config.suffix}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Code length</ControlLabel>
          <FormControl
            {...formProps}
            name="codeLength"
            type="number"
            min={6}
            value={config.codeLength}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Quantity</ControlLabel>
          <FormControl
            {...formProps}
            name="quantity"
            type="number"
            min={1}
            value={config.quantity}
            onChange={handleChange}
          />
        </FormGroup>

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
            value={config.staticCode}
            onChange={handleChange}
          />
        </FormGroup>

        {renderCommonFields(formProps)}
      </>
    );
  };

  const renderTabContent = (formProps) => {
    const { isSubmitted } = formProps;

    let content;

    if (['', 'default'].includes(currentTab)) {
      content = renderDefaultContent(formProps);
    }

    if ('static' === currentTab) {
      content = renderStaticContent(formProps);
    }

    if (content) {
      return (
        <>
          {content}
          <ModalFooter>
            <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
              Close
            </Button>

            {renderButton({
              name: 'codeConfig',
              values: generateDoc(),
              isSubmitted,
              object: null,
            })}
          </ModalFooter>
        </>
      );
    }

    return null;
  };

  const renderContent = (formProps: IFormProps) => {
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

  return <Form renderContent={renderContent} />;
};

export default ConfigForm;
