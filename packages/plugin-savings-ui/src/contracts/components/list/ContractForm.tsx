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
import { __ } from 'coreui/utils';
import { DateContainer } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import SelectContractType, {
  ContractTypeById
} from '../../../contractTypes/containers/SelectContractType';
import { IContract, IContractDoc } from '../../types';
import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';
import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import { IContractType } from '../../../contractTypes/types';
import { IUser } from '@erxes/ui/src/auth/types';

type Props = {
  currentUser: IUser;
  renderButton: (
    props: IButtonMutateProps & { disabled: boolean }
  ) => JSX.Element;
  contract: IContract;
  closeModal: () => void;
};

type State = {
  contractTypeId: string;
  number: string;
  status: string;
  branchId: string;
  description: string;
  savingAmount: number;
  startDate: Date;
  duration: number;
  interestRate: number;
  closeInterestRate: number;
  storeInterestInterval: string;
  customerId: string;
  customerType: string;

  currency: string;
  config?: {
    maxAmount: number;
    minAmount: number;
    maxDuration: number;
    minDuration: number;
    maxInterest: number;
    minInterest: number;
  };
  interestGiveType: string;
  closeOrExtendConfig: string;
  depositAccount?: string;
};

function isGreaterNumber(value: any, compareValue: any) {
  value = Number(value || 0);
  compareValue = Number(compareValue || 0);
  return value > compareValue;
}

class ContractForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { contract = {} } = props;

    this.state = {
      number: contract.number,
      status: contract.status,
      branchId: contract.branchId,
      description: contract.description,
      savingAmount: contract.savingAmount,
      startDate: contract.startDate,
      duration: contract.duration,
      interestRate: contract.interestRate,
      closeInterestRate: contract.closeInterestRate,
      contractTypeId: contract.contractTypeId,
      storeInterestInterval: contract.storeInterestInterval,
      customerId: contract.customerId,
      customerType: contract.customerType || 'customer',
      currency:
        contract.currency || this.props.currentUser.configs?.dealCurrency[0],
      interestGiveType: contract.interestGiveType,
      closeOrExtendConfig: contract.closeOrExtendConfig,
      depositAccount: contract.depositAccount
    };
  }

  generateDoc = (values: { _id: string } & IContractDoc) => {
    const { contract } = this.props;

    const finalValues = values;

    if (contract) {
      finalValues._id = contract._id;
    }

    const result = {
      _id: finalValues._id,
      ...this.state,
      contractTypeId: this.state.contractTypeId,
      branchId: this.state.branchId,
      status: this.state.status,
      description: this.state.description,
      createdBy: finalValues.createdBy,
      createdAt: finalValues.createdAt,
      savingAmount: Number(this.state.savingAmount),
      startDate: this.state.startDate,
      duration: Number(this.state.duration),
      interestRate: Number(this.state.interestRate),
      closeInterestRate: Number(this.state.closeInterestRate),
      storeInterestInterval: this.state.storeInterestInterval,
      customerId: this.state.customerId,
      customerType: this.state.customerType
    };

    return result;
  };

  renderFormGroup = (label, props) => {
    return (
      <FormGroup>
        <ControlLabel required={!label.includes('Amount')}>
          {__(label)}
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

  onSelectContractType = value => {
    const contractTypeObj: IContractType = ContractTypeById[value];

    var changingStateValue: any = { contractTypeId: value };

    changingStateValue['interestRate'] = Number(contractTypeObj?.interestRate);
    changingStateValue['closeInterestRate'] = Number(
      contractTypeObj?.closeInterestRate
    );
    changingStateValue['storeInterestInterval'] =
      contractTypeObj?.storeInterestInterval;

    if (!this.state.duration && contractTypeObj?.config?.minDuration) {
      changingStateValue['duration'] = contractTypeObj?.config?.minDuration;
    }

    this.setState({ ...changingStateValue });
  };

  onSelectCustomer = value => {
    this.setState({
      customerId: value
    });
  };

  onSelect = (value, key: string) => {
    this.setState({
      [key]: value
    } as any);
  };

  onCheckCustomerType = e => {
    this.setState({
      customerType: e.target.checked ? 'company' : 'customer'
    });
  };

  onFieldClick = e => {
    e.target.select();
  };

  checkValidation = (): any => {
    const errors: any = {};

    function errorWrapper(text: string) {
      return <label style={{ color: 'red' }}>{text}</label>;
    }

    if (
      this.state.config &&
      isGreaterNumber(this.state.interestRate, this.state.config.maxInterest)
    )
      errors.interestMonth = errorWrapper(
        `${__('Interest must less than')} ${this.state.config.maxInterest}`
      );

    return errors;
  };

  renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    const onChangeStartDate = value => {
      this.setState({ startDate: value });
    };

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>
                  {__('Contract Type')}
                </ControlLabel>
                <SelectContractType
                  label={__('Choose type')}
                  name="contractTypeId"
                  value={this.state.contractTypeId || ''}
                  onSelect={this.onSelectContractType}
                  multi={false}
                ></SelectContractType>
              </FormGroup>

              <div style={{ paddingBottom: '13px', paddingTop: '20px' }}>
                {this.renderFormGroup('Is Organization', {
                  ...formProps,
                  className: 'flex-item',
                  type: 'checkbox',
                  componentClass: 'checkbox',
                  name: 'customerType',
                  checked: this.state.customerType === 'company',
                  onChange: this.onCheckCustomerType
                })}
              </div>
              {this.state.customerType === 'customer' && (
                <FormGroup>
                  <ControlLabel required={true}>{__('Customer')}</ControlLabel>
                  <SelectCustomers
                    label="Choose customer"
                    name="customerId"
                    initialValue={this.state.customerId}
                    onSelect={this.onSelectCustomer}
                    multi={false}
                  />
                </FormGroup>
              )}

              {this.state.customerType === 'company' && (
                <FormGroup>
                  <ControlLabel required={true}>{__('Company')}</ControlLabel>
                  <SelectCompanies
                    label="Choose company"
                    name="customerId"
                    initialValue={this.state.customerId}
                    onSelect={this.onSelectCustomer}
                    multi={false}
                  />
                </FormGroup>
              )}
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>{__('Start Date')}</ControlLabel>
                <DateContainer>
                  <DateControl
                    {...formProps}
                    required={false}
                    name="startDate"
                    value={this.state.startDate}
                    onChange={onChangeStartDate}
                  />
                </DateContainer>
              </FormGroup>
              {this.renderFormGroup('Duration', {
                ...formProps,
                className: 'flex-item',
                type: 'number',
                useNumberFormat: true,
                name: 'duration',
                value: this.state.duration,
                onChange: this.onChangeField
              })}
              {this.renderFormGroup('Saving amount', {
                ...formProps,
                className: 'flex-item',
                type: 'number',
                useNumberFormat: true,
                name: 'savingAmount',
                value: this.state.savingAmount,
                onChange: this.onChangeField
              })}
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>
                  {__('Close or extend of time')}
                </ControlLabel>
                <FormControl
                  {...this.props}
                  name="closeOrExtendConfig"
                  componentClass="select"
                  value={this.state.closeOrExtendConfig}
                  required={true}
                  onChange={this.onChangeField}
                >
                  {['closeEndOfContract', 'autoExtend'].map(
                    (typeName, index) => (
                      <option key={index} value={typeName}>
                        {typeName}
                      </option>
                    )
                  )}
                </FormControl>
              </FormGroup>
              <FormGroup>
                <ControlLabel required={true}>
                  {__('Interest give type')}
                </ControlLabel>
                <FormControl
                  {...this.props}
                  name="interestGiveType"
                  componentClass="select"
                  value={this.state.interestGiveType}
                  required={true}
                  onChange={this.onChangeField}
                >
                  {['currentAccount', 'depositAccount'].map(
                    (typeName, index) => (
                      <option key={index} value={typeName}>
                        {typeName}
                      </option>
                    )
                  )}
                </FormControl>
              </FormGroup>
              {this.state.interestGiveType === 'depositAccount' &&
                this.renderFormGroup('Deposit account', {
                  ...formProps,
                  className: 'flex-item',
                  name: 'depositAccount',
                  value: this.state.depositAccount,
                  onChange: this.onChangeField
                })}
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
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__('Close')}
          </Button>

          {renderButton({
            name: 'contract',
            values: this.generateDoc(values),
            disabled: !!Object.keys(this.checkValidation()).length,
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

export default ContractForm;
