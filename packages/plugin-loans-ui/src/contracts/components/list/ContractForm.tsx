import {
  __,
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

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
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
  repayment: string;
  startDate: Date;
  scheduleDays: number[];
  customerId: string;
  customerType: string;

  debt: number;
  debtTenor: number;
  debtLimit: number;
  salvageAmount: number;
  salvagePercent: number;
  salvageTenor: number;

  relationExpertId: string;
  leasingExpertId: string;
  riskExpertId: string;

  leaseType: string;
  weekends: number[];
  useHoliday: boolean;
  relContractId?: string;
};

class ContractForm extends React.Component<Props, State | any> {
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

      relationExpertId: contract.relationExpertId || '',
      leasingExpertId: contract.leasingExpertId || '',
      riskExpertId: contract.riskExpertId || '',
      customerId: contract.customerId || '',
      customerType: contract.customerType || 'customer',
      leaseType:
        (contract.contractType && contract.contractType.leaseType) || 'finance',
      weekends: contract.weekends || [],
      useHoliday: contract.useHoliday || false,
      relContractId: contract.relContractId || ''
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
      repayment: this.state.repayment,
      startDate: this.state.startDate,
      scheduleDay: this.state.scheduleDay,
      debt: Number(this.state.debt),
      debtTenor: Number(this.state.debtTenor),
      debtLimit: Number(this.state.debtLimit),
      customerId: this.state.customerId || '',
      customerType: this.state.customerType || '',
      salvageAmount: 0,
      salvagePercent: 0,
      salvageTenor: 0,

      relationExpertId: this.state.relationExpertId,
      leasingExpertId: this.state.leasingExpertId,
      riskExpertId: this.state.riskExpertId,
      weekends: this.state.weekends.map(week => Number(week)),
      useHoliday: Boolean(this.state.useHoliday),
      relContractId: this.state.relContractId
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
          {label}
        </ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  };

  onChangeField = e => {
    const name = (e.target as HTMLInputElement).name;
    const value = (e.target as HTMLInputElement).value;
    this.setState({ [name]: value } as unknown);
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
    this.setState({ [name]: e.target.checked } as unknown);
  };

  onChangeWithSalvage = e => {
    const name = (e.target as HTMLInputElement).name;
    const value = (e.target as HTMLInputElement).value;
    this.setState({ [name]: value } as unknown);

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
        salvageAmount: (Number(value) * this.state.salvagePercent) / 100,
        feeAmount: (Number(value) / 100) * 0.5
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
        {this.renderFormGroup('salvage Percent', {
          ...formProps,
          type: 'number',
          name: 'salvagePercent',
          value: this.state.salvagePercent || 0,
          onChange: this.onChangeWithSalvage,
          required: true,
          onClick: this.onFieldClick
        })}
        {this.renderFormGroup('salvage Amount', {
          ...formProps,
          type: 'number',
          name: 'salvageAmount',
          value: this.state.salvageAmount || 0,
          onChange: this.onChangeWithSalvage,
          onClick: this.onFieldClick
        })}
        {this.renderFormGroup('salvage Tenor', {
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
    const contractTypeObj = ContractTypeById[value];

    this.setState({
      contractTypeId: value,
      leaseType: (contractTypeObj && contractTypeObj.leaseType) || 'finance',
      unduePercent: contractTypeObj?.unduePercent
    });
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
    const contractObj = ContractById[value];

    this.setState({
      relContractId: value
    });
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
                <ControlLabel required={true}>Contract Type</ControlLabel>
                <SelectContractType
                  label="Choose type"
                  name="contractTypeId"
                  value={this.state.contractTypeId || ''}
                  onSelect={this.onSelectContractType}
                  multi={false}
                ></SelectContractType>
              </FormGroup>

              <FormGroup>
                <ControlLabel required={true}>Start Date</ControlLabel>
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
                  <ControlLabel required={true}>Customer</ControlLabel>
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
                  <ControlLabel required={true}>Company</ControlLabel>
                  <SelectCompanies
                    label="Choose company"
                    name="customerId"
                    initialValue={this.state.customerId}
                    onSelect={this.onSelectCustomer}
                    multi={false}
                  />
                </FormGroup>
              )}

              {this.renderFormGroup('margin Amount', {
                ...formProps,
                type: 'number',
                name: 'marginAmount',
                value: this.state.marginAmount || 0,
                onChange: this.onChangeWithSalvage,
                onClick: this.onFieldClick
              })}

              {this.renderFormGroup('lease Amount', {
                ...formProps,
                type: 'number',
                name: 'leaseAmount',
                value: this.state.leaseAmount || 0,
                onChange: this.onChangeWithSalvage,
                onClick: this.onFieldClick
              })}

              {this.renderFormGroup('fee Amount', {
                ...formProps,
                type: 'number',
                name: 'feeAmount',
                value: this.state.feeAmount || 0,
                onChange: this.onChangeWithSalvage,
                onClick: this.onFieldClick
              })}

              {this.renderFormGroup('tenor', {
                ...formProps,
                type: 'number',
                name: 'tenor',
                value: this.state.tenor || 0,
                onChange: this.onChangeField,
                onClick: this.onFieldClick
              })}
            </FormColumn>
            <FormColumn>
              {this.renderFormGroup('interest Month', {
                ...formProps,
                type: 'number',
                name: 'interestMonth',
                value: this.state.interestMonth || 0,
                onChange: this.onChangeInterest,
                onClick: this.onFieldClick
              })}

              {this.renderFormGroup('interest Rate', {
                ...formProps,
                type: 'number',
                name: 'interestRate',
                value: this.state.interestRate || 0,
                onChange: this.onChangeInterest,
                onClick: this.onFieldClick
              })}

              {this.renderFormGroup('Undue Percent', {
                ...formProps,
                type: 'number',
                name: 'unduePercent',
                value: this.state.unduePercent || 0,
                onChange: this.onChangeUnduePercent,
                onClick: this.onFieldClick
              })}

              <FormGroup>
                <ControlLabel required={true}>Repayment</ControlLabel>
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
                <ControlLabel>schedule Days</ControlLabel>
                <Select
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

              {this.renderFormGroup('debt', {
                ...formProps,
                type: 'number',
                name: 'debt',
                value: this.state.debt || 0,
                onChange: this.onChangeField,
                onClick: this.onFieldClick
              })}
              {this.renderFormGroup('debt Tenor', {
                ...formProps,
                type: 'number',
                name: 'debtTenor',
                value: this.state.debtTenor || 0,
                onChange: this.onChangeField,
                onClick: this.onFieldClick
              })}

              {this.renderFormGroup('debt Limit', {
                ...formProps,
                type: 'number',
                name: 'debtLimit',
                value: this.state.debtLimit || 0,
                onChange: this.onChangeField,
                onClick: this.onFieldClick
              })}
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel>Closed Contract</ControlLabel>
                <SelectContract
                  label="Choose closed contract"
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
                  label="Choose branch"
                  initialValue={this.state?.branchId}
                  onSelect={onChangeBranchId}
                  multi={false}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Relation Expert</ControlLabel>
                <SelectTeamMembers
                  label="Choose an relation expert"
                  name="relationExpertId"
                  initialValue={this.state.relationExpertId}
                  onSelect={this.onSelectTeamMember}
                  multi={false}
                />
              </FormGroup>

              <FormGroup>
                <ControlLabel>Leasing Expert</ControlLabel>
                <SelectTeamMembers
                  label="Choose an leasing expert"
                  name="leasingExpertId"
                  initialValue={this.state.leasingExpertId}
                  onSelect={this.onSelectTeamMember}
                  multi={false}
                />
              </FormGroup>

              <FormGroup>
                <ControlLabel>Risk Expert</ControlLabel>
                <SelectTeamMembers
                  label="Choose an risk expert"
                  name="riskExpertId"
                  initialValue={this.state.riskExpertId}
                  onSelect={this.onSelectTeamMember}
                  multi={false}
                />
              </FormGroup>

              <FormGroup>
                <ControlLabel>Weekends</ControlLabel>
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

              {this.renderFormGroup('Use holiday', {
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
                <ControlLabel>Description</ControlLabel>
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
            Close
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

export default ContractForm;
