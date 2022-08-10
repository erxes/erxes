import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';

import ControlLabel from '@erxes/ui/src/components/form/Label';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import React from 'react';
import SelectBrand from '@erxes/ui-inbox/src/settings/integrations/containers/SelectBrand';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  callback: () => void;
};

class TwilioSms extends React.Component<Props, { loading: boolean }> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  generateDoc = (values: {
    name: string;
    accountSid: string;
    authToken: string;
    phoneNumberSid: string;
    brandId: string;
  }) => {
    return {
      name: values.name,
      brandId: values.brandId,
      kind: 'smooch-twilio',
      data: {
        displayName: values.name,
        accountSid: values.accountSid,
        authToken: values.authToken,
        phoneNumberSid: values.phoneNumberSid
      }
    };
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, callback } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        {this.state.loading && <Spinner />}
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl {...formProps} name="name" required={true} />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Twilio Account SID</ControlLabel>
          <FormControl
            {...formProps}
            type="text"
            name="accountSid"
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Auth Token</ControlLabel>
          <FormControl
            {...formProps}
            type="text"
            name="authToken"
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Phone Number SID</ControlLabel>
          <FormControl
            {...formProps}
            type="text"
            name="phoneNumberSid"
            required={true}
          />
        </FormGroup>

        <a
          href="https://erxes.org/administrator/system-config#twilio-sms"
          target="_blank"
          rel="noopener noreferrer"
        >
          {'Learn more about Twilio'}
        </a>

        <SelectBrand isRequired={true} formProps={formProps} />

        <ModalFooter>
          {renderButton({
            name: 'integration',
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

export default TwilioSms;
