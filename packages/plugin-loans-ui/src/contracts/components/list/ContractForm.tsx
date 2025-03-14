import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';
import { IUser } from '@erxes/ui/src/auth/types';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { Tabs as MainTabs, TabTitle } from '@erxes/ui/src/components/tabs';
import {
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
} from '@erxes/ui/src/styles/eindex';
import { DateContainer } from '@erxes/ui/src/styles/main';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from 'coreui/utils';
import dayjs from 'dayjs';
import moment from 'moment';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { LoanPurpose } from '../../../constants';
import { LEASE_TYPES } from '../../../contractTypes/constants';
import SelectContractType from '../../../contractTypes/containers/SelectContractType';
import { IContractType, IContractTypeDoc } from '../../../contractTypes/types';
import { RelType } from '../../containers/ContractForm';
import { IContract, IContractDoc, IStepRules } from '../../types';
import SelectSavingContract, {
  Contracts,
} from '../collaterals/SelectSavingContract';
import StepRulesForm from './StepRulesForm';

const onFieldClick = (e) => {
  e.target.select();
};

type Props = {
  currentUser: IUser;
  renderButton: (
    props: IButtonMutateProps & { disabled: boolean }
  ) => JSX.Element;
  contract?: IContract;
  closeModal: () => void;
  change?: boolean;
  data?: RelType;
};

const isGreaterNumber = (value: any, compareValue: any) => {
  value = Number(value || 0);
  compareValue = Number(compareValue || 0);
  return value > compareValue;
};

interface ITabItem {
  component: any;
  label: string;
}

interface ITabs {
  tabs: ITabItem[];
}

export const Tabs = ({ tabs }: ITabs) => {
  const [tabIndex, setTabIndex] = React.useState(0);

  return (
    <>
      <MainTabs>
        {tabs.map((tab, index) => (
          <TabTitle
            className={tabIndex === index ? 'active' : ''}
            key={`tab${tab.label}`}
            onClick={() => setTabIndex(index)}
          >
            {tab.label}
          </TabTitle>
        ))}
      </MainTabs>

      <div style={{ width: '100%', marginTop: 20 }}>
        {tabs?.[tabIndex]?.component}
      </div>
    </>
  );
};

function ContractForm(props: Props) {
  const [contract, setContract] = useState(
    props.contract ||
      ({
        customerType: 'customer',
        repayment: 'fixed',
      } as IContract)
  );

  const [contractType, setContractType] = useState<IContractTypeDoc>(
    props.contract?.contractType || {}
  );

  const [stepRules, setStepRules] = useState<IStepRules[]>(
    props.contract?.stepRules || []
  );

  const generateDoc = (values: { _id: string } & IContractDoc) => {
    const result = {
      ...contract,
      ...values,
      contractTypeId: contract.contractTypeId,
      branchId: contract.branchId,
      status: contract.status,
      description: contract.description,
      marginAmount: Number(contract.marginAmount),
      leaseAmount: Number(contract.leaseAmount),
      feeAmount: Number(contract.feeAmount),
      tenor: Number(contract.tenor),
      lossPercent: Number(contract.lossPercent),
      interestRate: Number(contract.interestRate),
      repayment: contract.repayment,
      lossCalcType: contract.lossCalcType || 'fromInterest',
      startDate: contract.startDate || new Date(),
      scheduleDays: contract.scheduleDays,
      debt: Number(contract.debt),
      debtTenor: Number(contract.debtTenor),
      debtLimit: Number(contract.debtLimit),
      customerId: contract.customerId || '',
      customerType: contract.customerType || '',
      relationExpertId: contract.relationExpertId,
      leasingExpertId: contract.leasingExpertId,
      riskExpertId: contract.riskExpertId,
      leaseType: contract.leaseType,
      savingContractId: contract.savingContractId,
      commitmentInterest: contract.commitmentInterest,
      weekends: contract.weekends?.map((week) => Number(week)),
      relContractId: contract.relContractId,
      currency: contract.currency,
      useManualNumbering: contract.useManualNumbering,
      loanPurpose: contract.loanPurpose,
      loanDestination: contract.loanDestination,
      endDate: contract.endDate,
      holidayType: contract.holidayType,
      depositAccountId: contract.depositAccountId,
      firstPayDate: contract.firstPayDate,
      contractDate: contract.contractDate,
      stepRules,
    };

    return result;
  };

  useEffect(() => {
    setContract({
      ...contract,
      feeAmount:
        contractType?.defaultFee ||
        (contract.leaseAmount / 100) * (contractType?.feePercent ?? 0),
    });
  }, [contractType, contract.leaseAmount]);

  useEffect(() => {
    if (
      !contract.startDate ||
      !Array.isArray(contract.scheduleDays) ||
      contract.scheduleDays.length === 0 ||
      contract.tenor === null
    ) {
      return;
    }

    const startDate = new Date(contract.startDate); // Convert to Date object
    const selectedDays = [...(contract.scheduleDays || [])].sort(
      (a, b) => a - b
    ); // Ensure ascending order

    let firstPayDate: Date | null = null;
    const startDay = startDate.getDate();
    const startMonth = startDate.getMonth();
    const startYear = startDate.getFullYear();

    // Find the next available day in the same month
    for (let day of selectedDays) {
      if (day >= startDay) {
        firstPayDate = new Date(startYear, startMonth, day);
        break;
      }
    }

    // If no valid day is found, move to the next month with the earliest selected day
    if (!firstPayDate) {
      const nextMonth = startMonth + 1;
      const nextYear = nextMonth > 11 ? startYear + 1 : startYear;
      const finalMonth = nextMonth % 12;

      const firstDayOfNextMonth = selectedDays[0];

      // Get last valid day of the next month
      const lastDayOfNextMonth = new Date(
        nextYear,
        finalMonth + 1,
        0
      ).getDate();
      const validDay = Math.min(firstDayOfNextMonth, lastDayOfNextMonth);

      firstPayDate = new Date(nextYear, finalMonth, validDay);
    }

    // 📌 Calculate the End Date based on `tenor` (how many times rent will be paid)
    let endDate = new Date(startDate);

    if (contract.scheduleDays.length === 1) {
      // If there's only 1 day in scheduleDays, rent is paid once per month
      endDate.setMonth(startDate.getMonth() + Math.ceil(contract.tenor)); // End date is `tenor` months later
    } else if (contract.scheduleDays.length > 1) {
      // If there are multiple days in scheduleDays, rent is paid twice per month
      endDate.setMonth(startDate.getMonth() + Math.ceil(contract.tenor / 2)); // 2 months later
    }

    setContract({
      ...contract,
      firstPayDate,
      endDate,
    });
  }, [contract.startDate, contract.scheduleDays, contract.tenor]);

  const renderFormGroup = (label, props) => {
    if (!label) return <FormControl {...props} />;
    return (
      <FormGroup>
        <ControlLabel required={props.required}>{__(label)}</ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  };

  const onChangeField = (e) => {
    const name = (e?.target as HTMLInputElement)?.name;
    let value: any = (e?.target as HTMLInputElement)?.value;

    if ((e?.target as HTMLInputElement)?.type === 'checkbox') {
      value = (e.target as HTMLInputElement).checked;
    }

    if (name === 'interestRate') {
      setContract((v) => ({
        ...v,
        interestRate: Number(value),
        interestMonth: Number(value || 0) / 12,
      }));
      return;
    }

    setContract((v) => ({ ...v, [name]: value }));
  };

  const onSelectTeamMember = (value, name) => {
    setContract((v) => ({ ...v, [name]: value }));
  };

  const onSelectContractType = (contractTypeId, obj?: IContractType) => {
    const selectedContractType = obj || ({} as IContractType);

    let changingStateValue: any = {
      contractTypeId,
      leaseType:
        (selectedContractType && selectedContractType.leaseType) || 'finance',
      commitmentInterest:
        (selectedContractType && selectedContractType.commitmentInterest) || 0,
      useMargin: selectedContractType.useMargin,
      useSkipInterest: selectedContractType.useSkipInterest,
      useDebt: selectedContractType.useDebt,
      currency: selectedContractType.currency,
      useManualNumbering: selectedContractType?.useManualNumbering,
      interestRate: selectedContractType.defaultInterest,
      feeAmount:
        selectedContractType.defaultFee ||
        (contract.leaseAmount / 100) * (selectedContractType.feePercent ?? 0),
    };

    if (!contract.lossPercent) {
      changingStateValue['lossPercent'] = selectedContractType?.lossPercent;
    }
    if (!contract.lossCalcType) {
      changingStateValue['lossCalcType'] = selectedContractType?.lossCalcType;
    }
    if (selectedContractType?.defaultInterest) {
      changingStateValue['interestMonth'] = Number(
        selectedContractType?.defaultInterest
      );
      changingStateValue['interestRate'] = Number(
        selectedContractType?.defaultInterest || 0
      );
    }

    if (!contract.tenor && selectedContractType?.config?.minTenor) {
      changingStateValue['tenor'] = selectedContractType?.config?.minTenor;
    }

    if (!contract.leaseAmount && selectedContractType?.config?.minAmount) {
      changingStateValue['leaseAmount'] =
        selectedContractType?.config?.minAmount;
    }

    setContractType({
      ...selectedContractType,
    });

    setContract((v) => ({ ...v, ...changingStateValue }));
  };

  const onSelectCustomer = (value) => {
    setContract((v) => ({ ...v, customerId: value }));
  };

  const onCheckCustomerType = (e) => {
    setContract((v) => ({
      ...v,
      customerType: e.target.checked ? 'company' : 'customer',
    }));
  };

  const checkValidation = (): any => {
    const errors: any = {};

    function errorWrapper(text: string) {
      return <label style={{ color: 'red' }}>{text}</label>;
    }

    if (
      contractType.useMargin &&
      contract.leaseAmount &&
      Number(contract.marginAmount) < Number(contract.leaseAmount)
    )
      errors.marginAmount = errorWrapper(
        'Margin Amount can not be less than lease Amount'
      );

    if (
      contractType?.config?.minAmount &&
      isGreaterNumber(contractType.config.minAmount, contract.leaseAmount)
    )
      errors.leaseAmount = errorWrapper(
        `${__('Lease amount must greater than')} ${contractType.config.minAmount}`
      );

    if (
      contractType?.config?.maxAmount &&
      isGreaterNumber(contract.leaseAmount, contractType.config.maxAmount)
    )
      errors.leaseAmount = errorWrapper(
        `${__('Lease amount must less than')} ${contractType.config.maxAmount}`
      );

    if (
      contractType?.config?.minTenor &&
      isGreaterNumber(contractType.config.minTenor, contract.tenor)
    )
      errors.tenor = errorWrapper(
        `${__('Tenor must greater than')} ${contractType.config.minTenor}`
      );

    if (
      contractType?.config?.maxTenor &&
      isGreaterNumber(contract.tenor, contractType.config.maxTenor)
    )
      errors.tenor = errorWrapper(
        `${__('Tenor must less than')} ${contractType.config.maxTenor}`
      );

    if (
      contractType?.config?.minInterest &&
      isGreaterNumber(contractType.config.minInterest, contract.interestRate)
    )
      errors.interestRate = errorWrapper(
        `${__('Interest must greater than')} ${Number(contractType.config.minInterest).toFixed(0)}`
      );

    if (
      contractType?.config?.maxInterest &&
      isGreaterNumber(contract.interestRate, contractType.config.maxInterest)
    )
      errors.interestRate = errorWrapper(
        `${__('Interest must less than')} ${Number(contractType.config.maxInterest ?? '0').toFixed(0)}`
      );

    return errors;
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { values, isSubmitted } = formProps;

    const onChangeBranchId = (value) => {
      setContract((v) => ({ ...v, branchId: value }));
    };

    const onChangeContractDate = (value) => {
      setContract((v) => ({ ...v, contractDate: value }));
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
                  initialValue={contract.contractTypeId || ''}
                  onSelect={(contractTypeId, obj) => {
                    onSelectContractType(contractTypeId, obj);
                  }}
                  multi={false}
                />
              </FormGroup>
              <div style={{ paddingBottom: '13px', paddingTop: '20px' }}>
                {renderFormGroup('Is Organization', {
                  ...formProps,
                  className: 'flex-item',
                  type: 'checkbox',
                  componentclass: 'checkbox',
                  name: 'customerType',
                  checked: contract.customerType === 'company',
                  onChange: onCheckCustomerType,
                })}
              </div>
              {(contract.customerType === 'company' && (
                <FormGroup>
                  <ControlLabel required={true}>{__('Company')}</ControlLabel>
                  <SelectCompanies
                    label={__('Choose company')}
                    name="customerId"
                    initialValue={contract.customerId}
                    onSelect={onSelectCustomer}
                    multi={false}
                  />
                </FormGroup>
              )) || (
                <FormGroup>
                  <ControlLabel required={true}>{__('Customer')}</ControlLabel>
                  <SelectCustomers
                    label={__('Choose customer')}
                    name="customerId"
                    initialValue={contract.customerId}
                    onSelect={onSelectCustomer}
                    multi={false}
                  />
                </FormGroup>
              )}
              {contract.useManualNumbering &&
                renderFormGroup('Contract Number', {
                  ...formProps,
                  name: 'contractNumber',
                  value: contract.number,
                  onChange: onChangeField,
                  onClick: onFieldClick,
                })}
              <FormGroup>
                <ControlLabel required={true}>{__('Loan Type')}</ControlLabel>
                <FormControl
                  {...formProps}
                  name="loanDestination"
                  componentclass="select"
                  value={contract.loanDestination}
                  onChange={onChangeField}
                >
                  {LoanPurpose.destination.map((type) => (
                    <option key={type.code} value={type.code}>
                      {__(type.name)}
                    </option>
                  ))}
                </FormControl>
              </FormGroup>
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>
                  {__('Contract Date')}
                </ControlLabel>
                <DateContainer>
                  <DateControl
                    {...formProps}
                    required={false}
                    dateFormat="YYYY/MM/DD"
                    name="contractDate"
                    value={contract.contractDate}
                    onChange={onChangeContractDate}
                  />
                </DateContainer>
              </FormGroup>
              {renderFormGroup('Fee Amount', {
                ...formProps,
                type: 'number',
                name: 'feeAmount',
                useNumberFormat: true,
                fixed: 2,
                value: contract.feeAmount || 0,
                onChange: onChangeField,
                onClick: onFieldClick,
              })}

              <FormGroup>
                <ControlLabel required={true}>
                  {__('Loan Purpose')}
                </ControlLabel>
                <FormControl
                  {...formProps}
                  name="loanPurpose"
                  componentclass="select"
                  value={contract.loanPurpose}
                  onChange={onChangeField}
                >
                  {LoanPurpose.purpose
                    .filter((a) =>
                      contract.loanDestination
                        ? a.parent === contract.loanDestination
                        : true
                    )
                    .map((type) => (
                      <option key={type.name} value={type.name}>
                        {__(type.name)}
                      </option>
                    ))}
                </FormControl>
              </FormGroup>

              {contractType.useMargin &&
                renderFormGroup('Margin Amount', {
                  ...formProps,
                  type: 'number',
                  name: 'marginAmount',
                  useNumberFormat: true,
                  fixed: 2,
                  value: contract.marginAmount || 0,
                  required: true,
                  errors: checkValidation(),
                  onChange: onChangeField,
                  onClick: onFieldClick,
                })}
              {contractType.useMargin &&
                renderFormGroup('Down payment', {
                  ...formProps,
                  type: 'number',
                  name: 'downPayment',
                  useNumberFormat: true,
                  fixed: 2,
                  value:
                    (contract.marginAmount || 0) -
                      (contract.leaseAmount || 0) || 0,
                  onChange: onChangeField,
                  onClick: onFieldClick,
                })}
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel>{__('Branches')}</ControlLabel>
                <SelectBranches
                  name="branchId"
                  label={__('Choose branch')}
                  initialValue={contract.branchId}
                  onSelect={onChangeBranchId}
                  multi={false}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>{__('Leasing Expert')}</ControlLabel>
                <SelectTeamMembers
                  label={__('Choose an leasing expert')}
                  name="leasingExpertId"
                  initialValue={contract.leasingExpertId}
                  onSelect={onSelectTeamMember}
                  multi={false}
                />
              </FormGroup>

              {contract.leaseType === LEASE_TYPES.SAVING && contractType && (
                <FormGroup>
                  <ControlLabel required={true}>
                    {__('Saving Contract')}
                  </ControlLabel>
                  <SelectSavingContract
                    label={__('Choose an contract')}
                    name="depositAccount"
                    initialValue={contract.savingContractId}
                    filterParams={{
                      isDeposit: false,
                      customerId: contract.customerId,
                    }}
                    onSelect={(v) => {
                      if (typeof v === 'string') {
                        const savingContract = Contracts[v];
                        const changecontract = contract;

                        let changeState: any = {
                          savingContractId: v,
                          endDate: savingContract.endDate,
                        };
                        if (
                          contractType.savingUpperPercent &&
                          contractType.savingPlusLoanInterest
                        ) {
                          changecontract.leaseAmount =
                            (savingContract.savingAmount *
                              contractType.savingUpperPercent) /
                            100;
                          changecontract.interestRate =
                            savingContract.interestRate +
                            contractType.savingPlusLoanInterest;
                          changecontract.tenor = dayjs(
                            savingContract.endDate
                          ).diff(
                            dayjs(contract.startDate ?? new Date()),
                            'month'
                          );
                        }
                        setContract((v) => ({ ...v, ...changeState }));
                      }
                    }}
                    multi={false}
                  />
                </FormGroup>
              )}

              <FormGroup>
                <ControlLabel required={true}>
                  {__('Deposit Contract')}
                </ControlLabel>
                <SelectSavingContract
                  label={__('Choose an contract')}
                  name="depositAccountId"
                  initialValue={contract.depositAccountId}
                  filterParams={{
                    isDeposit: true,
                    customerId: contract.customerId,
                  }}
                  onSelect={(depositAccountId) => {
                    if (typeof depositAccountId === 'string') {
                      setContract((v) => ({
                        ...v,
                        ['depositAccountId']: depositAccountId,
                      }));
                    }
                  }}
                  multi={false}
                  exactFilter={true}
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
                  componentclass="textarea"
                  value={contract.description || ''}
                  onChange={onChangeField}
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
            values: generateDoc(values),
            disabled: !!Object.keys(checkValidation()).length,
            isSubmitted,
            object: props.contract,
          })}
        </ModalFooter>
      </>
    );
  };

  const renderGraphic = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { values, isSubmitted } = formProps;

    const onChangeStartDate = (value) => {
      setContract((v) => ({ ...v, startDate: value }));
    };

    const onChangeFirstPayDate = (value) => {
      setContract((v) => ({ ...v, firstPayDate: value }));
    };

    const onSelectScheduleDays = (values) => {
      onChangeField({
        target: { name: 'scheduleDays', value: values.map((val) => val.value) },
      });
    };

    const scheduleOptions = new Array(31).fill(1).map((row, index) => ({
      value: row + index,
      label: row + index,
    }));

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>{__('Start Date')}</ControlLabel>
                <DateContainer>
                  <DateControl
                    {...formProps}
                    required={false}
                    name="startDate"
                    dateFormat="YYYY/MM/DD"
                    value={contract.startDate}
                    onChange={onChangeStartDate}
                  />
                </DateContainer>
              </FormGroup>
              {renderFormGroup('Lease Amount', {
                type: 'number',
                name: 'leaseAmount',
                useNumberFormat: true,
                required: true,
                fixed: 2,
                value: contract.leaseAmount || 0,
                errors: checkValidation(),
                onChange: onChangeField,
              })}
              {renderFormGroup('Tenor /duration month/', {
                type: 'number',
                name: 'tenor',
                useNumberFormat: true,
                value: contract.tenor || 0,
                errors: checkValidation(),
                required: true,
                max: contractType?.config?.maxTenor,
                onChange: onChangeField,
              })}
              <FormGroup>
                <ControlLabel required={true}>
                  {__('Holiday type')}
                </ControlLabel>
                <FormControl
                  {...formProps}
                  name="holidayType"
                  componentclass="select"
                  value={contract.holidayType}
                  onChange={onChangeField}
                >
                  {['before', 'exact', 'after'].map((typeName, index) => (
                    <option key={typeName} value={typeName}>
                      {__(typeName + 'Method')}
                    </option>
                  ))}
                </FormControl>
              </FormGroup>
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>
                  {__('First Pay Date')}
                </ControlLabel>
                <DateContainer>
                  <DateControl
                    {...formProps}
                    required={false}
                    name="firstPayDate"
                    dateFormat="YYYY/MM/DD"
                    value={contract.firstPayDate}
                    isValidDate={(date) => {
                      const startDate = new Date(contract.startDate);
                      const maxDate = moment(startDate).add(45, 'day').toDate();

                      if (date > maxDate) return false;
                      if (startDate > date) return false;
                      return true;
                    }}
                  />
                </DateContainer>
              </FormGroup>

              <FormGroup>
                <ControlLabel required={true}>{__('Repayment')}</ControlLabel>
                <FormControl
                  {...formProps}
                  name="repayment"
                  componentclass="select"
                  value={contract.repayment}
                  onChange={onChangeField}
                >
                  {['fixed', 'equal', 'last'].map((typeName) => (
                    <option key={typeName} value={typeName}>
                      {__(typeName + 'Method')}
                    </option>
                  ))}
                </FormControl>
              </FormGroup>

              {renderFormGroup('Interest Rate in Year', {
                ...formProps,
                type: 'number',
                useNumberFormat: true,
                fixed: 2,
                name: 'interestRate',
                value: contract.interestRate || 0,
                errors: checkValidation(),
                onChange: onChangeField,
                onClick: onFieldClick,
              })}

              {contract.leaseType === LEASE_TYPES.LINEAR &&
                renderFormGroup('Commitment interest', {
                  ...formProps,
                  type: 'number',
                  useNumberFormat: true,
                  fixed: 2,
                  name: 'commitmentInterest',
                  value: contract.commitmentInterest || 0,
                  errors: checkValidation(),
                  onChange: onChangeField,
                  onClick: onFieldClick,
                })}
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel required>{__('Schedule Days')}</ControlLabel>
                <Select
                  required
                  className="flex-item"
                  placeholder={__('Choose an schedule Days')}
                  value={scheduleOptions.filter((o) =>
                    contract.scheduleDays?.includes(o.value)
                  )}
                  onChange={onSelectScheduleDays}
                  isMulti={true}
                  options={scheduleOptions}
                />
              </FormGroup>

              <FormGroup>
                <ControlLabel required={true}>{__('End Date')}</ControlLabel>
                <DateContainer>
                  <DateControl
                    {...formProps}
                    required={false}
                    dateFormat="YYYY/MM/DD"
                    name="endDate"
                    value={contract.endDate}
                  />
                </DateContainer>
              </FormGroup>

              {renderFormGroup('Interest rate in Month', {
                ...formProps,
                name: 'interestRateInMonth',
                type: 'number',
                value: (contract.interestRate || 0) / 12,
                onChange: (e) =>
                  setContract({
                    ...contract,
                    interestRate: (e.target as any).value * 12,
                  }),
              })}
            </FormColumn>
          </FormWrapper>

          {<StepRulesForm stepRules={stepRules} setStepRules={setStepRules} />}
        </ScrollWrapper>
        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__('Close')}
          </Button>

          {renderButton({
            name: 'contract',
            values: generateDoc(values),
            disabled: !!Object.keys(checkValidation()).length,
            isSubmitted,
            object: props.contract,
          })}
        </ModalFooter>
      </>
    );
  };

  const { change } = props;
  if (change) return <Form renderContent={renderGraphic} />;
  return (
    <Tabs
      tabs={[
        {
          label: 'Гэрээ',
          component: <Form renderContent={renderContent} />,
        },
        {
          label: 'Хуваарь',
          component: <Form renderContent={renderGraphic} />,
        },
      ]}
    />
  );
}

export default ContractForm;
