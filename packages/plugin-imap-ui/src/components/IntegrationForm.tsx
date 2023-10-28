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
import { __ } from 'coreui/utils';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  callback: () => void;
  onChannelChange: () => void;
  channelIds: string[];
};

class IntegrationForm extends React.Component<Props> {
  generateDoc = (values: {
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
        password: values.password
      }
    };
  };

  renderField = ({
    label,
    name,
    formProps,
    required = true
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

  renderContent = (formProps: IFormProps) => {
    const { renderButton, callback, onChannelChange, channelIds } = this.props;
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

        {this.renderField({ label: 'Name', name: 'name', formProps })}
        {this.renderField({ label: 'Host', name: 'host', formProps })}
        {this.renderField({ label: 'Smpt host', name: 'smtpHost', formProps })}
        {this.renderField({ label: 'Smpt port', name: 'smtpPort', formProps })}
        {this.renderField({
          label: 'Main user (for a mail with aliases)',
          name: 'mainUser',
          required: false,
          formProps
        })}
        {this.renderField({
          label: 'User',
          name: 'user',
          formProps
        })}
        {this.renderField({ label: 'Password', name: 'password', formProps })}

        <SelectBrand
          isRequired={true}
          formProps={formProps}
          description={__(
            'Which specific Brand does this integration belong to?'
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
            values: this.generateDoc(values),
            isSubmitted,
            callback
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default IntegrationForm;
