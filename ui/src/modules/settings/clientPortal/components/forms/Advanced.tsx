import FormGroup from 'erxes-ui/lib/components/form/Group';
import ControlLabel from 'erxes-ui/lib/components/form/Label';
import Toggle from 'erxes-ui/lib/components/Toggle';
import { FlexContent, FlexItem } from 'erxes-ui/lib/layout/styles';
import React from 'react';
import { Content } from '../../styles';
import { AdvancedSettings } from '../../types';

type Props = {
  handleFormChange: (name: string, value: string | object) => void;
  advanced?: AdvancedSettings;
};

type Item = {
  name: string;
  value?: boolean;
  label: string;
};

function Advanced({ advanced = {}, handleFormChange }: Props) {
  const {
    enableCaptcha,
    authAllow,
    autoSuggest,
    viewTicket,
    showSpecificTicket,
    submitTicket
  } = advanced;

  function renderControl({ label, name, value }: Item) {
    const handleChange = e => {
      const currentConfig = { ...advanced };

      currentConfig[name] = e.target.checked;

      handleFormChange('advanced', currentConfig);
    };

    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <Toggle
          value={name}
          checked={Boolean(value)}
          onChange={handleChange}
          icons={{
            checked: null,
            unchecked: null
          }}
        />
      </FormGroup>
    );
  }

  function renderContent(
    title: string,
    desciption: string,
    content: JSX.Element
  ) {
    return (
      <FormGroup>
        <h2>{title}</h2>
        <ControlLabel>{desciption}</ControlLabel>
        <FlexItem>{content}</FlexItem>
      </FormGroup>
    );
  }

  return (
    <Content>
      {renderContent(
        'User Sign Up and Login',
        'Allow users to Sign Up from the customer portal',
        <FlexContent>
          {renderControl({
            name: 'allowAuth',
            label: 'Yes',
            value: authAllow
          })}
          {renderControl({
            name: 'allowAuth',
            label: 'No',
            value: !authAllow
          })}
          {renderControl({
            name: 'allowAuth',
            label: 'Connect your databse',
            value: false
          })}
        </FlexContent>
      )}
      {renderContent(
        'User Permissions for portal',
        'Who can submit a new ticket on portal',
        <>
          <FlexContent>
            {renderControl({
              name: 'permission',
              label: 'Logged in users',
              value: submitTicket
            })}
            {renderControl({
              name: 'permission',
              label: 'Everyone',
              value: !submitTicket
            })}
          </FlexContent>
          {renderControl({
            name: 'enableCaptcha',
            label: 'Enable CAPTCHA to help avoid spam',
            value: enableCaptcha
          })}
          {renderControl({
            name: 'autoSuggest',
            label: 'Auto-suggest solutions while creating a new ticket',
            value: autoSuggest
          })}
        </>
      )}
      {renderContent(
        '',
        'Who can view tickets on portal',
        <>
          <FlexContent>
            {renderControl({
              name: 'viewTicket',
              label: 'Logged in Users',
              value: viewTicket
            })}
            {renderControl({
              name: 'viewTicket',
              label: 'Anyone with a public ticket URL',
              value: !viewTicket
            })}
          </FlexContent>
          {renderControl({
            name: 'showSpecificTicket',
            label: 'Allow users to view only portal specific tickets',
            value: showSpecificTicket
          })}
        </>
      )}
    </Content>
  );
}

export default Advanced;
