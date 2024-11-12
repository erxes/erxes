import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';

import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { Info, ModalFooter } from '@erxes/ui/src/styles/main';
import React from 'react';
import SelectBrand from '@erxes/ui-inbox/src/settings/integrations/containers/SelectBrand';
import SelectChannels from '@erxes/ui-inbox/src/settings/integrations/containers/SelectChannels';
import { __ } from '@erxes/ui/src';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  callback: () => void;
  onChannelChange: () => void;
  channelIds: string[];
};

const IntegrationForm = (props: Props) => {
  const { renderButton, callback, onChannelChange, channelIds } = props;

  const generateDoc = (values: {
    name: string;
    host: string;
    smtpHost: string;
    smtpPort: string;
    mainUser: string;
    user: string;
    password: string;
    brandId: string;
  }) => {
    return {
      name: values.name,
      brandId: values.brandId,
      kind: 'imap',
      data: {
        host: values.host,
        smtpHost: values.smtpHost,
        smtpPort: values.smtpPort,
        mainUser: values.mainUser,
        user: values.user,
        password: values.password,
      },
    };
  };

  const renderField = ({
    label,
    name,
    formProps,
    required = true,
  }: {
    label: string;
    name: string;
    formProps: IFormProps;
    required?: boolean;
  }) => {
    return (
      <FormGroup>
        <ControlLabel required={required}>{label}</ControlLabel>
        <FormControl
          {...formProps}
          name={name}
          required={required}
          autoFocus={name === 'name'}
        />
      </FormGroup>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        <div>
          For gmail fill the following information
          <ul>
            <li>Host: imap.gmail.com</li>
            <li>Smpt host: smtp.gmail.com</li>
            <li>Smpt port: 465</li>
            <li>
              Password:{' '}
              <a
                target="blank"
                href="https://support.google.com/accounts/answer/185833?hl=en"
              >
                Follow the app password creation guide
              </a>
            </li>
          </ul>
          <br />
        </div>

        {renderField({ label: 'Name', name: 'name', formProps })}
        {renderField({ label: 'Host', name: 'host', formProps })}
        {renderField({ label: 'Smpt host', name: 'smtpHost', formProps })}
        {renderField({ label: 'Smpt port', name: 'smtpPort', formProps })}
        {renderField({
          label: __('Main user (for a mail with aliases)'),
          name: 'mainUser',
          required: false,
          formProps,
        })}
        {renderField({
          label: __('User'),
          name: 'user',
          formProps,
        })}
        {renderField({ label: __('Password'), name: 'password', formProps })}

        <SelectBrand
          isRequired={true}
          formProps={formProps}
          description={__(
            'Which specific Brand does this integration belong to?',
          )}
        />

        <SelectChannels
          defaultValue={channelIds}
          isRequired={true}
          onChange={onChannelChange}
        />

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={callback}
            icon="times-circle"
          >
            Cancel
          </Button>
          {renderButton({
            values: generateDoc(values),
            isSubmitted,
            callback,
          })}
        </ModalFooter>
      </>
    );
  };
  return <Form renderContent={renderContent} />;
};

export default IntegrationForm;
