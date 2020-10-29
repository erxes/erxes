import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { IFormProps } from 'modules/common/types';
import React from 'react';

type Props = {
  onSuccess: (password: string, values: any[]) => void;
  closeModal: () => void;
  formProps: IFormProps;
};

class PasswordConfirmation extends React.Component<Props> {
  submit = values => {
    this.props.onSuccess(values.password, this.props.formProps.values);
    this.props.closeModal();
  };

  renderContent = formProps => {
    return (
      <>
        <FormGroup>
          <ControlLabel>Enter your password to Confirm</ControlLabel>
          <FormControl
            autoFocus={true}
            type="password"
            name="password"
            required={true}
            {...formProps}
          />
        </FormGroup>
        <ModalFooter>
          <Button
            btnStyle="simple"
            icon="times-circle"
            uppercase={false}
            onClick={this.props.closeModal}
          >
            Cancel
          </Button>
          <Button type="submit" btnStyle="success" icon="check-circle" uppercase={false}>
            Save
          </Button>
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} onSubmit={this.submit} />;
  }
}

export default PasswordConfirmation;
