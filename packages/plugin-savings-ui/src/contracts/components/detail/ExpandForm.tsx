import {
  Button,
  ControlLabel,
  DateControl,
  Form,
  FormControl,
  FormGroup,
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
  Info
} from '@erxes/ui/src';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import { IContract, IContractDoc } from '../../types';
import { __ } from 'coreui/utils';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  contract: IContract;
  closeModal: () => void;
};

type State = {
  closeType: string;
  description: string;
};

class ExpandForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      closeType: '',
      description: ''
    };
  }

  generateDoc = (values: { _id: string } & IContractDoc) => {
    const { contract } = this.props;

    return {
      id: contract._id
    };
  };

  renderFormGroup = (label, props) => {
    return (
      <FormGroup>
        <ControlLabel required={!label.includes('Amount')}>
          {label}
        </ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  };

  onFieldClick = e => {
    e.target.select();
  };

  renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton, contract } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <ScrollWrapper>
          <Info type="danger" title="Анхаар">
            Гэрээний сунгалт {contract.duration} сараар хийгдэнэ
          </Info>
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__('Close')}
          </Button>

          {renderButton({
            name: 'contract',
            values: this.generateDoc(values),
            isSubmitted,
            object: this.props.contract
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default ExpandForm;
