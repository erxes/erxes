import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Spinner from 'modules/common/components/Spinner';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import React from 'react';
import SelectBrand from '../../containers/SelectBrand';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
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
    const { renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        {this.state.loading && <Spinner />}
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl {...formProps} name="name" required={true} />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Twilio Account SID</ControlLabel>
          <FormControl
            {...formProps}
            type="text"
            name="accountSid"
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Auth Token</ControlLabel>
          <FormControl
            {...formProps}
            type="text"
            name="authToken"
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Phone Number SID</ControlLabel>
          <FormControl
            {...formProps}
            type="text"
            name="phoneNumberSid"
            required={true}
          />
        </FormGroup>

        <SelectBrand isRequired={true} formProps={formProps} />

        <ModalFooter>
          {renderButton({
            name: 'integration',
            values: this.generateDoc(values),
            isSubmitted,
            callback: this.props.closeModal
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
