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
  MainStyleScrollWrapper as ScrollWrapper
} from '@erxes/ui/src';
import { DateContainer } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import { ChangeAmount } from '../../styles';
import { IContract, IContractDoc } from '../../types';
import { __ } from 'coreui/utils';
import SelectContracts, {
  Contracts
} from '../../../contracts/components/common/SelectContract';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  contract: IContract;
  onChangeDate: (date: Date) => void;
  closeModal: () => void;
  invDate: Date;
  type: string;
};

type State = {
  type: string;
  description: string;
  interestAmount: number;
  contractId: string;
  contract?: IContract;
};

class InterestChangeForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      type: props.type || 'interestChange',
      description: '',
      interestAmount: 0,
      contractId: props.contract?._id
    };
  }

  generateDoc = (values: { _id: string } & IContractDoc) => {
    const { contract } = this.props;

    const finalValues = values;

    if (contract) {
      finalValues._id = contract._id;
    }

    return {
      ...this.state,
      interestAmount: Number(this.state.interestAmount),
      description: this.state.description,
      invDate: this.props.invDate,
      type: this.state.type
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

  onChangeField = e => {
    const name = (e.target as HTMLInputElement).name;
    const value = (e.target as HTMLInputElement).value;
    this.setState({ [name]: value } as any);
  };

  onFieldClick = e => {
    e.target.select();
  };

  renderRow = (label, fieldName) => {
    const { contract } = this.state;
    if (!contract) return null;
    const value = contract[fieldName] || 0;
    return (
      <FormWrapper>
        <FormColumn>
          <ChangeAmount>
            <ControlLabel>{__(label)}</ControlLabel>
          </ChangeAmount>
        </FormColumn>
        <FormColumn>
          <ChangeAmount>{Number(value).toLocaleString()}</ChangeAmount>
        </FormColumn>
      </FormWrapper>
    );
  };
  renderCloseInfo = () => {
    return (
      <>
        {this.renderRow('Saving Amount', 'savingAmount')}
        {this.renderRow('Stored Interest', 'storedInterest')}
        {this.renderRow('Total', 'total')}
      </>
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton, onChangeDate } = this.props;
    const { values, isSubmitted } = formProps;

    const onChangeinvDate = value => {
      onChangeDate(value);
    };

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>{__('Change Date')}</ControlLabel>
                <DateContainer>
                  <DateControl
                    {...formProps}
                    required={false}
                    name="invDate"
                    value={this.props.invDate}
                    onChange={onChangeinvDate}
                  />
                </DateContainer>
              </FormGroup>
            </FormColumn>
          </FormWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel>{__('Contract')}</ControlLabel>
                <SelectContracts
                  label={__('Choose an contract')}
                  name="contractId"
                  initialValue={this.state.contractId || ''}
                  onSelect={(v, n) => {
                    if (typeof v === 'string') {
                      this.setState({
                        contractId: v,
                        contract: Contracts[v]
                      });
                    }
                  }}
                  multi={false}
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel>{__('Interest Change to')}</ControlLabel>
                <FormControl
                  {...formProps}
                  name="interestAmount"
                  type="number"
                  useNumberFormat
                  value={this.state.interestAmount || ''}
                  onChange={this.onChangeField}
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel>{__('Description')}</ControlLabel>
                <FormControl
                  {...formProps}
                  max={140}
                  name="description"
                  componentClass="textarea"
                  value={this.state.description || ''}
                  onChange={this.onChangeField}
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>

          {this.renderCloseInfo()}
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

export default InterestChangeForm;
