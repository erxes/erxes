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

class CallPro extends React.Component<Props, { loading: boolean }> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  generateDoc = (values: {
    name: string;
    phoneNumber: string;
    tenant: string;
    brandId: string;
  }) => {
    return {
      name: `${values.name} - ${values.phoneNumber}`,
      brandId: values.brandId,
      kind: 'callpro',
      data: {
        tenant: values.tenant,
        phoneNumber: values.phoneNumber
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
          <FormControl {...formProps} name='name' required={true} />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Phone number</ControlLabel>
          <FormControl
            {...formProps}
            type='number'
            name='phoneNumber'
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Tenant</ControlLabel>
          <FormControl {...formProps} type='text' name='tenant' />
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

export default CallPro;
