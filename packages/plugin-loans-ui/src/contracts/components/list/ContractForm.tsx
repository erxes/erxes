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
  SelectTeamMembers
} from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import { DateContainer } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import Select from 'react-select-plus';
import { WEEKENDS } from '../../../constants';
import SelectContractType, {
  ContractTypeById
} from '../../../contractTypes/containers/SelectContractType';
import SelectContract, { ContractById } from '../../containers/SelectContract';
import { IContract, IContractDoc } from '../../types';
import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';
import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
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
  status: string;
  description: string;
  marginAmount: number;
  leaseAmount: number;
  feeAmount: number;
  tenor: number;
  interestRate: number;
  interestMonth: number;
  skipInterestCalcMonth: number;
  repayment: string;
  startDate: Date;
  scheduleDays: number[];
  customerId: string;
  customerType: string;
  branchId: string;
  unduePercent: number;
  undueCalcType: string;
  currency: string;

  debt: number;
  debtTenor: number;
  debtLimit: number;
  salvageAmount: number;
  salvagePercent: number;
  salvageTenor: number;

  relationExpertId: string;
  leasingExpertId: string;
  riskExpertId: string;
  useDebt: boolean;
  useMargin: boolean;
  useSkipInterest: boolean;
  leaseType: string;
  weekends: number[];
  useHoliday: boolean;
  relContractId?: string;
  config?: {
    maxAmount: number;
    minAmount: number;
    maxTenor: number;
    minTenor: number;
    maxInterest: number;
    minInterest: number;
  };
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
      contractTypeId: contract.contractTypeId || '',
      status: contract.status,
      branchId: contract.branchId,
      description: contract.description || '',
      marginAmount: contract.marginAmount || 0,
      leaseAmount: contract.leaseAmount || 0,
      feeAmount: contract.feeAmount || 0,
      tenor: contract.tenor || 0,
      unduePercent: contract.unduePercent || 0,
      undueCalcType: contract.undueCalcType,
      interestRate: contract.interestRate || 0,
      interestMonth: (contract.interestRate || 0) / 12,
      repayment: contract.repayment || 'fixed',
      startDate: contract.startDate || new Date(),
      scheduleDays: contract.scheduleDays || [new Date().getDate()],
      debt: contract.debt || 0,
      debtTenor: contract.debtTenor || 0,
      debtLimit: contract.debtLimit || 0,
      salvageAmount: contract.salvageAmount || 0,
      salvagePercent: contract.salvagePercent || 0,
      salvageTenor: contract.salvageTenor || 0,
      skipInterestCalcMonth: contract.skipInterestCalcMonth || 0,
      useDebt: contract.useDebt,
      useMargin: contract.useMargin,
      useSkipInterest: contract.useSkipInterest,
      relationExpertId: contract.relationExpertId || '',
      leasingExpertId: contract.leasingExpertId || '',
      riskExpertId: contract.riskExpertId || '',
      customerId: contract.customerId || '',
      customerType: contract.customerType || 'customer',
      leaseType:
        (contract.contractType && contract.contractType.leaseType) || 'finance',
      weekends: contract.weekends || [],
      useHoliday: contract.useHoliday || false,
      relContractId: contract.relContractId || '',
      currency:
        contract.currency || this.props.currentUser.configs?.dealCurrency[0]
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
      // number: this.state.number,
      status: this.state.status,
      description: this.state.description,
      createdBy: finalValues.createdBy,
      createdAt: finalValues.createdAt,
      marginAmount: Number(this.state.marginAmount),
      leaseAmount: Number(this.state.leaseAmount),
      feeAmount: Number(this.state.feeAmount),
      tenor: Number(this.state.tenor),
      unduePercent: Number(this.state.unduePercent),
      interestRate: Number(this.state.interestRate),
      skipInterestCalcMonth: Number(this.state.skipInterestCalcMonth),
      repayment: this.state.repayment,
      undueCalcType: this.state.undueCalcType || 'fromInterest',
      startDate: this.state.startDate,
      scheduleDays: this.state.scheduleDays,
      debt: Number(this.state.debt),
      debtTenor: Number(this.state.debtTenor),
      debtLimit: Number(this.state.debtLimit),
      customerId: this.state.customerId || '',
      customerType: this.state.customerType || '',
      salvageAmount: 0,
      salvagePercent: 0,
      salvageTenor: 0,
      useDebt: this.state.useDebt,
      useMargin: this.state.useMargin,
      useSkipInterest: this.state.useSkipInterest,
      relationExpertId: this.state.relationExpertId,
      leasingExpertId: this.state.leasingExpertId,
      riskExpertId: this.state.riskExpertId,
      weekends: this.state.weekends.map(week => Number(week)),
      useHoliday: Boolean(this.state.useHoliday),
      relContractId: this.state.relContractId,
      currency: this.state.currency
    };

    if (this.state.leaseType === 'salvage') {
      result.salvageAmount = Number(this.state.salvageAmount);
      result.salvagePercent = Number(this.state.salvagePercent);
      result.salvageTenor = Number(this.state.salvageTenor);
    }

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

  onChangeInterest = e => {
    const name = (e.target as HTMLInputElement).name;
    const value = (e.target as HTMLInputElement).value;

    if (name === 'interestRate') {
      this.setState({
        interestRate: Number(value),
        interestMonth: Number(value || 0) / 12
      });
      return;
    }

    // interestMonth
    this.setState({
      interestRate: Number((Number(value || 0) * 12).toFixed(2)),
      interestMonth: Number(value || 0)
    });
    return;
  };

  onChangeUnduePercent = e => {
    const value = (e.target as HTMLInputElement).value;
    // unduePercent
    this.setState({
      unduePercent: Number(value || 0)
    });
    return;
  };

  onChangeCheckbox = e => {
    const name = (e.target as HTMLInputElement).name;
    this.setState({ [name]: e.target.checked } as any);
  };

  onChangeWithSalvage = e => {
    const name = (e.target as HTMLInputElement).name;
    const value = (e.target as HTMLInputElement).value;

    this.setState({ [name]: value } as any);

    if (this.state.leaseType === 'finance') {
      return;
    }

    const { leaseAmount } = this.state;

    if (name === 'salvageAmount' && leaseAmount) {
      if (Number(value) > leaseAmount) {
        this.setState({ [name]: leaseAmount, salvagePercent: 100 });
        return;
      }
      this.setState({ salvagePercent: (Number(value) * 100) / leaseAmount });
      return;
    }

    if (name === 'salvagePercent') {
      if (Number(value) > 100) {
        this.setState({ [name]: 100, salvageAmount: leaseAmount });
        return;
      }
      this.setState({ salvageAmount: (leaseAmount / 100) * Number(value) });
      return;
    }

    if (name === 'leaseAmount') {
      this.setState({
        salvageAmount: (Number(value) * this.state.salvagePercent) / 100
      });
      return;
    }
  };

  renderSalvage = (formProps: IFormProps) => {
    if (this.state.leaseType === 'finance') {
      return <></>;
    }

    return (
      <>
        {this.renderFormGroup('Salvage Percent', {
          ...formProps,
          type: 'number',
          name: 'salvagePercent',
          value: this.state.salvagePercent || 0,
          onChange: this.onChangeWithSalvage,
          required: true,
          onClick: this.onFieldClick
        })}
        {this.renderFormGroup('Salvage Amount', {
          ...formProps,
          type: 'number',
          name: 'salvageAmount',
          value: this.state.salvageAmount || 0,
          onChange: this.onChangeWithSalvage,
          onClick: this.onFieldClick
        })}
        {this.renderFormGroup('Salvage Tenor', {
          ...formProps,
          type: 'number',
          name: 'salvageTenor',
          value: this.state.salvageTenor || 0,
          onChange: this.onChangeField,
          onClick: this.onFieldClick
        })}
      </>
    );
  };

  onSelectTeamMember = (value, name) => {
    this.setState({ [name]: value } as any);
  };

  onSelectContractType = value => {
    const contractTypeObj: IContractType = ContractTypeById[value];

    var changingStateValue: any = {
      contractTypeId: value,
      leaseType: (contractTypeObj && contractTypeObj.leaseType) || 'finance',
      useMargin: contractTypeObj.useMargin,
      useSkipInterest: contractTypeObj.useSkipInterest,
      useDebt: contractTypeObj.useDebt,
      currency: contractTypeObj.currency,
      config: contractTypeObj?.config
    };

    if (!this.state.unduePercent) {
      changingStateValue['unduePercent'] = contractTypeObj?.unduePercent;
    }
    if (!this.state.undueCalcType) {
      changingStateValue['undueCalcType'] = contractTypeObj?.undueCalcType;
    }
    if (!this.state.interestMonth && contractTypeObj?.config?.defaultInterest) {
      changingStateValue['interestMonth'] = Number(
        contractTypeObj?.config?.defaultInterest
      );
      changingStateValue['interestRate'] = Number(
        (Number(contractTypeObj?.config?.defaultInterest || 0) * 12).toFixed(2)
      );
    }

    if (!this.state.tenor && contractTypeObj?.config?.minTenor) {
      changingStateValue['tenor'] = contractTypeObj?.config?.minTenor;
    }

    if (!this.state.leaseAmount && contractTypeObj?.config?.minAmount) {
      changingStateValue['leaseAmount'] = contractTypeObj?.config?.minAmount;
    }

    this.setState({ ...changingStateValue });
  };

  onSelectCustomer = value => {
    this.setState({
      customerId: value
    });
  };

  onCheckCustomerType = e => {
    this.setState({
      customerType: e.target.checked ? 'company' : 'customer'
    });
  };

  onFieldClick = e => {
    e.target.select();
  };

  onSelectWeekends = values => {
    this.setState({ weekends: values.map(val => val.value) });
  };

  onSelectScheduleDays = values => {
    this.setState({ scheduleDays: values.map(val => val.value) });
  };

  onSelectRelContract = value => {
    this.setState({
      relContractId: value
    });
  };

  checkValidation = (): any => {
    const errors: any = {};

    function errorWrapper(text: string) {
      return <label style={{ color: 'red' }}>{text}</label>;
    }

    if (
      this.state.useMargin &&
      this.state.leaseAmount &&
      Number(this.state.marginAmount) < Number(this.state.leaseAmount)
    )
      errors.marginAmount = errorWrapper(
        'Margin Amount can not be less than lease Amount'
      );

    if (
      this.state.config &&
      isGreaterNumber(this.state.config.minAmount, this.state.leaseAmount)
    )
      errors.leaseAmount = errorWrapper(
        `${__('Lease amount must greater than')} ${this.state.config.minAmount}`
      );

    if (
      this.state.config &&
      isGreaterNumber(this.state.leaseAmount, this.state.config.maxAmount)
    )
      errors.leaseAmount = errorWrapper(
        `${__('Lease amount must less than')} ${this.state.config.maxAmount}`
      );

    if (
      this.state.config &&
      isGreaterNumber(this.state.config.minTenor, this.state.tenor)
    )
      errors.tenor = errorWrapper(
        `${__('Tenor must greater than')} ${this.state.config.minTenor}`
      );

    if (
      this.state.config &&
      isGreaterNumber(this.state.tenor, this.state.config.maxTenor)
    )
      errors.tenor = errorWrapper(
        `${__('Tenor must less than')} ${this.state.config.maxTenor}`
      );

    if (
      this.state.config &&
      isGreaterNumber(this.state.config.minInterest, this.state.interestMonth)
    )
      errors.interestMonth = errorWrapper(
        `${__('Interest must greater than')} ${this.state.config.minInterest}`
      );

    if (
      this.state.config &&
      isGreaterNumber(this.state.interestMonth, this.state.config.maxInterest)
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

    const onChangeBranchId = value => {
      this.setState({ branchId: value });
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

              {this.state.useMargin &&
                this.renderFormGroup('Margin Amount', {
                  ...formProps,
                  type: 'number',
                  name: 'marginAmount',
                  useNumberFormat: true,
                  fixed: 2,
                  value: this.state.marginAmount || 0,
                  errors: this.checkValidation(),
                  onChange: this.onChangeWithSalvage,
                  onClick: this.onFieldClick
                })}

              {this.renderFormGroup('Lease Amount', {
                ...formProps,
                type: 'number',
                name: 'leaseAmount',
                useNumberFormat: true,
                fixed: 2,
                value: this.state.leaseAmount || 0,
                errors: this.checkValidation(),
                onChange: this.onChangeWithSalvage,
                onClick: this.onFieldClick
              })}

              {this.renderFormGroup('Fee Amount', {
                ...formProps,
                type: 'number',
                name: 'feeAmount',
                useNumberFormat: true,
                fixed: 2,
                value: this.state.feeAmount || 0,
                onChange: this.onChangeWithSalvage,
                onClick: this.onFieldClick
              })}

              {this.renderFormGroup('Tenor', {
                ...formProps,
                type: 'number',
                name: 'tenor',
                useNumberFormat: true,
                value: this.state.tenor || 0,
                errors: this.checkValidation(),
                onChange: this.onChangeField,
                onClick: this.onFieldClick
              })}
            </FormColumn>
            <FormColumn>
              {this.renderFormGroup('Interest Month', {
                ...formProps,
                type: 'number',
                name: 'interestMonth',
                value: this.state.interestMonth || 0,
                useNumberFormat: true,
                fixed: 2,
                errors: this.checkValidation(),
                onChange: this.onChangeInterest,
                onClick: this.onFieldClick
              })}

              {this.renderFormGroup('Interest Rate', {
                ...formProps,
                type: 'number',
                useNumberFormat: true,
                fixed: 2,
                name: 'interestRate',
                value: this.state.interestRate || 0,
                onChange: this.onChangeInterest,
                onClick: this.onFieldClick
              })}
              {this.state.useSkipInterest &&
                this.renderFormGroup('Skip Interest Calc /Month/', {
                  ...formProps,
                  type: 'number',
                  name: 'skipInterestCalcMonth',
                  value: this.state.skipInterestCalcMonth,
                  onChange: this.onChangeField,
                  onClick: this.onFieldClick
                })}
              {this.renderFormGroup('Loss Percent', {
                ...formProps,
                type: 'number',
                name: 'unduePercent',
                useNumberFormat: true,
                fixed: 2,
                value: this.state.unduePercent || 0,
                onChange: this.onChangeUnduePercent,
                onClick: this.onFieldClick
              })}
              <FormGroup>
                <ControlLabel required={true}>{__('Repayment')}</ControlLabel>
                <FormControl
                  {...formProps}
                  name="repayment"
                  componentClass="select"
                  value={this.state.repayment}
                  required={true}
                  onChange={this.onChangeField}
                >
                  {['fixed', 'equal'].map((typeName, index) => (
                    <option key={index} value={typeName}>
                      {typeName}
                    </option>
                  ))}
                </FormControl>
              </FormGroup>
              <FormGroup>
                <ControlLabel required={true}>{__('Currency')}</ControlLabel>
                <FormControl
                  {...formProps}
                  name="currency"
                  componentClass="select"
                  value={this.state.currency}
                  required={true}
                  onChange={this.onChangeField}
                >
                  {this.props.currentUser.configs?.dealCurrency?.map(
                    (typeName, index) => (
                      <option key={index} value={typeName}>
                        {typeName}
                      </option>
                    )
                  )}
                </FormControl>
              </FormGroup>

              <FormGroup>
                <ControlLabel required>{__('Schedule Days')}</ControlLabel>
                <Select
                  required
                  className="flex-item"
                  placeholder={__('Choose an schedule Days')}
                  value={this.state.scheduleDays}
                  onChange={this.onSelectScheduleDays}
                  multi={true}
                  options={new Array(31).fill(1).map((row, index) => ({
                    value: row + index,
                    label: row + index
                  }))}
                />
              </FormGroup>
              {this.state.useDebt && (
                <>
                  {this.renderFormGroup('Debt', {
                    ...formProps,
                    type: 'number',
                    name: 'debt',
                    useNumberFormat: true,
                    fixed: 2,
                    value: this.state.debt || 0,
                    onChange: this.onChangeField,
                    onClick: this.onFieldClick
                  })}
                  {this.renderFormGroup('Debt Tenor', {
                    ...formProps,
                    type: 'number',
                    name: 'debtTenor',
                    useNumberFormat: true,
                    fixed: 2,
                    value: this.state.debtTenor || 0,
                    onChange: this.onChangeField,
                    onClick: this.onFieldClick
                  })}

                  {this.renderFormGroup('Debt Limit', {
                    ...formProps,
                    type: 'number',
                    name: 'debtLimit',
                    useNumberFormat: true,
                    fixed: 2,
                    value: this.state.debtLimit || 0,
                    onChange: this.onChangeField,
                    onClick: this.onFieldClick
                  })}
                </>
              )}
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel>{__('Closed Contract')}</ControlLabel>
                <SelectContract
                  label={__('Choose closed contract')}
                  name="relContractId"
                  value={this.state.relContractId || ''}
                  onSelect={this.onSelectRelContract}
                  multi={false}
                  filterParams={{ closeDate: this.state.startDate }}
                  customOption={{ label: ' ', value: '' }}
                ></SelectContract>
              </FormGroup>
              <FormGroup>
                <ControlLabel>{__('Branches')}</ControlLabel>
                <SelectBranches
                  name="branchId"
                  label={__('Choose branch')}
                  initialValue={this.state?.branchId}
                  onSelect={onChangeBranchId}
                  multi={false}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>{__('Relation Expert')}</ControlLabel>
                <SelectTeamMembers
                  label={__('Choose an relation expert')}
                  name="relationExpertId"
                  initialValue={this.state.relationExpertId}
                  onSelect={this.onSelectTeamMember}
                  multi={false}
                />
              </FormGroup>

              <FormGroup>
                <ControlLabel>{__('Leasing Expert')}</ControlLabel>
                <SelectTeamMembers
                  label={__('Choose an leasing expert')}
                  name="leasingExpertId"
                  initialValue={this.state.leasingExpertId}
                  onSelect={this.onSelectTeamMember}
                  multi={false}
                />
              </FormGroup>

              <FormGroup>
                <ControlLabel>{__('Risk Expert')}</ControlLabel>
                <SelectTeamMembers
                  label={__('Choose an risk expert')}
                  name="riskExpertId"
                  initialValue={this.state.riskExpertId}
                  onSelect={this.onSelectTeamMember}
                  multi={false}
                />
              </FormGroup>

              <FormGroup>
                <ControlLabel>{__('Weekends')}</ControlLabel>
                <Select
                  className="flex-item"
                  placeholder={__('Choose an weekend days')}
                  value={this.state.weekends}
                  onChange={this.onSelectWeekends}
                  multi={true}
                  options={Object.keys(WEEKENDS).map(key => ({
                    value: key,
                    label: WEEKENDS[key]
                  }))}
                />
              </FormGroup>

              {this.renderFormGroup('Use Holiday', {
                ...formProps,
                className: 'flex-item',
                type: 'checkbox',
                componentClass: 'checkbox',
                name: 'useHoliday',
                checked: this.state.useHoliday || false,
                onChange: this.onChangeCheckbox
              })}

              {this.renderSalvage(formProps)}
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
