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
import SelectContractType from '../../../contractTypes/containers/SelectContractType';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  contract: IContract;
  closeModal: () => void;
};

type State = {
  closeType: string;
  description: string;
  contractTypeId: string;
};

class ExpandForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      closeType: '',
      description: '',
      contractTypeId: props.contract.contractTypeId
    };
  }

  generateDoc = () => {
    const { contract } = this.props;

    return {
      id: contract._id,
      contractTypeId: this.state.contractTypeId
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

  onSelectContractType(value) {
    this.setState({ contractTypeId: value });
  }

  renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton, contract } = this.props;
    const { isSubmitted } = formProps;

    return (
      <>
        <ScrollWrapper>
          <Info type="danger" title="Анхаар">
            Гэрээний сунгалт {contract.duration} сараар хийгдэнэ
          </Info>
          <FormGroup>
            <ControlLabel required={true}>{__('Contract Type')}</ControlLabel>
            <SelectContractType
              label={__('Choose type')}
              name="contractTypeId"
              value={this.state.contractTypeId || ''}
              onSelect={this.onSelectContractType}
              multi={false}
            ></SelectContractType>
          </FormGroup>
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__('Close')}
          </Button>

          {renderButton({
            name: 'contract',
            values: this.generateDoc(),
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
