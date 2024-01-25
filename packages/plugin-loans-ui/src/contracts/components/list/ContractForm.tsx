import {
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
} from '@erxes/ui/src/styles/eindex';

import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { TabTitle, Tabs as MainTabs } from '@erxes/ui/src/components/tabs';
import Table from '@erxes/ui/src/components/table';
import Icon from '@erxes/ui/src/components/Icon';
import dayjs from 'dayjs';
import { __ } from 'coreui/utils';
import { DateContainer } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useState } from 'react';
import Select from 'react-select-plus';
import SelectContractType, {
  ContractTypeById,
} from '../../../contractTypes/containers/SelectContractType';
import { IContract, IContractDoc } from '../../types';
import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';
import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import { IContractType } from '../../../contractTypes/types';
import { IUser } from '@erxes/ui/src/auth/types';
import { generateCustomGraphic, getDiffDay } from '../../utils/customGraphic';
import { LoanContract, LoanSchedule } from '../../interface/LoanContract';
import { LoanPurpose, ORGANIZATION_TYPE } from '../../../constants';
import { LEASE_TYPES } from '../../../contractTypes/constants';
import SelectSavingContract, {
  Contracts,
} from '../collaterals/SelectSavingContract';

type Props = {
  currentUser: IUser;
  renderButton: (
    props: IButtonMutateProps & { disabled: boolean },
  ) => JSX.Element;
  contract: IContract;
  closeModal: () => void;
  change?: boolean;
};

interface State extends LoanContract {
  config?: {
    maxAmount: number;
    minAmount: number;
    maxTenor: number;
    minTenor: number;
    maxInterest: number;
    minInterest: number;
    savingPlusLoanInterest: number;
    savingUpperPercent: number;
  };
  schedule: LoanSchedule[];
  contractNumber?: string;
  changeRowIndex?: number;
}

function isGreaterNumber(value: any, compareValue: any) {
  value = Number(value || 0);
  compareValue = Number(compareValue || 0);
  return value > compareValue;
}

interface ITabItem {
  component: any;
  label: string;
}

interface ITabs {
  tabs: ITabItem[];
}

export function Tabs({ tabs }: ITabs) {
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
}

const ContractForm = (props: Props) => {
  const { contract = {} as IContract, currentUser } = props;

  const [contractNumber, setContractNumber] = useState(contract.number);
  const [isPayFirstMonth, setIsPayFirstMonth] = useState(null as any);
  const [isBarter, setIsBarter] = useState(null as any);
  const [changeRowIndex, setChangeRowIndex] = useState(null as any);
  const [contractDate, setContractDate] = useState(
    contract.contractDate || new Date(),
  );
  const [endDate, setEndDate] = useState(contract.endDate);
  const [loanPurpose, setLoanPurpose] = useState(contract.loanPurpose);
  const [loanDestination, setLoanDestination] = useState(
    contract.loanDestination,
  );
  const [loanSubPurpose, setLoanSubPurpose] = useState(contract.loanSubPurpose);
  const [contractTypeId, setContractTypeId] = useState(
    contract.contractTypeId || '',
  );
  const [status, setStatus] = useState(contract.status);
  const [branchId, setBranchId] = useState(contract.branchId);
  const [leaseType, setLeaseType] = useState(contract.leaseType);
  const [description, setDescription] = useState(contract.description || '');
  const [marginAmount, setMarginAmount] = useState(contract.marginAmount || 0);
  const [leaseAmount, setLeaseAmount] = useState(contract.leaseAmount || 0);
  const [feeAmount, setFeeAmount] = useState(contract.feeAmount || 0);
  const [tenor, setTenor] = useState(contract.tenor || 0);
  const [unduePercent, setUnduePercent] = useState(contract.unduePercent || 0);
  const [undueCalcType, setUndueCalcType] = useState(contract.undueCalcType);
  const [interestRate, setInterestRate] = useState(contract.interestRate || 0);
  const [interestMonth, setInterestMonth] = useState(
    (contract.interestRate || 0) / 12,
  );
  const [repayment, setRepayment] = useState(contract.repayment || 'fixed');
  const [startDate, setStartDate] = useState(contract.startDate || new Date());
  const [scheduleDays, setScheduleDays] = useState(
    contract.scheduleDays || [new Date().getDate()],
  );
  const [debt, setDebt] = useState(contract.debt || 0);
  const [debtTenor, setDebtTenor] = useState(contract.debtTenor || 0);
  const [debtLimit, setDebtLimit] = useState(contract.debtLimit || 0);
  const [salvageAmount, setSalvageAmount] = useState(
    contract.salvageAmount || 0,
  );
  const [salvagePercent, setSalvagePercent] = useState(
    contract.salvagePercent || 0,
  );
  const [salvageTenor, setSalvageTenor] = useState(contract.salvageTenor || 0);
  const [skipInterestCalcMonth, setSkipInterestCalcMonth] = useState(
    contract.skipInterestCalcMonth || 0,
  );
  const [useDebt, setUseDebt] = useState(contract.useDebt);
  const [useMargin, setUseMargin] = useState(contract.useMargin);
  const [useSkipInterest, setUseSkipInterest] = useState(
    contract.useSkipInterest,
  );
  const [relationExpertId, setRelationExpertId] = useState(
    contract.relationExpertId || '',
  );
  const [leasingExpertId, setLeasingExpertId] = useState(
    contract.leasingExpertId || '',
  );
  const [riskExpertId, setRiskExpertId] = useState(contract.riskExpertId || '');
  const [customerId, setCustomerId] = useState(contract.customerId || '');
  const [customerType, setCustomerType] = useState(
    contract.customerType || 'customer',
  );
  const [weekends, setWeekends] = useState(contract.weekends || []);
  const [useHoliday, setUseHoliday] = useState(contract.useHoliday || false);
  const [relContractId, setRelContractId] = useState(
    contract.relContractId || '',
  );
  const [skipAmountCalcMonth, setSkipAmountCalcMonth] = useState(
    contract.skipAmountCalcMonth || 0,
  );
  const [customInterest, setCustomInterest] = useState(
    contract.customInterest || 0,
  );
  const [customPayment, setCustomPayment] = useState(
    contract.customPayment || 0,
  );
  const [currency, setCurrency] = useState(
    contract.currency || currentUser.configs?.dealCurrency[0],
  );
  const [downPayment, setDownPayment] = useState(contract.downPayment || 0);
  const [useFee, setUseFee] = useState(contract.useFee);
  const [useManualNumbering, setUseManualNumbering] = useState(
    contract.useManualNumbering,
  );
  const [commitmentInterest, setCommitmentInterest] = useState(
    contract.commitmentInterest,
  );
  const [savingContractId, setSavingContractId] = useState(
    contract.savingContractId,
  );
  const [schedule, setSchedule] = useState(
    contract.repayment === 'custom'
      ? generateCustomGraphic({
          dateRange: contract.scheduleDays,
          interestRate: contract.interestRate,
          leaseAmount: contract.leaseAmount,
          startDate: contract.startDate,
          tenor: contract.tenor,
          isPayFirstMonth: contract.isPayFirstMonth,
          skipAmountCalcMonth: contract.skipAmountCalcMonth,
          customPayment: contract.customPayment,
          customInterest: contract.customInterest,
        })
      : [],
  );
  const [config, setConfig] = useState({} as any);

  const generateDoc = (values: { _id: string } & IContractDoc) => {
    const finalValues = values;

    if (contract) {
      finalValues._id = contract._id;
    }

    const result: State & {
      createdBy: string;
      createdAt: Date;
      number?: string;
      _id: string;
    } = {
      _id: finalValues._id,
      number: contractNumber,
      contractDate: contractDate,
      loanSubPurpose: loanSubPurpose,
      interestMonth: interestMonth,
      contractTypeId: contractTypeId,
      branchId: branchId,
      status: status,
      description: description,
      createdBy: finalValues.createdBy,
      createdAt: finalValues.createdAt,
      marginAmount: Number(marginAmount),
      leaseAmount: Number(leaseAmount),
      feeAmount: Number(feeAmount),
      tenor: Number(tenor),
      unduePercent: Number(unduePercent),
      interestRate: Number(interestRate),
      skipInterestCalcMonth: Number(skipInterestCalcMonth),
      skipAmountCalcMonth: Number(skipAmountCalcMonth),
      customPayment: Number(customPayment),
      customInterest: Number(customInterest),
      repayment: repayment,
      undueCalcType: undueCalcType || 'fromInterest',
      startDate: startDate,
      scheduleDays: scheduleDays,
      debt: Number(debt),
      debtTenor: Number(debtTenor),
      debtLimit: Number(debtLimit),
      customerId: customerId || '',
      customerType: customerType || '',
      salvageAmount: 0,
      salvagePercent: 0,
      salvageTenor: 0,
      useDebt: useDebt,
      useMargin: useMargin,
      useSkipInterest: useSkipInterest,
      relationExpertId: relationExpertId,
      leasingExpertId: leasingExpertId,
      riskExpertId: riskExpertId,
      leaseType: leaseType,
      savingContractId: savingContractId,
      commitmentInterest: commitmentInterest,
      weekends: weekends.map((week) => Number(week)),
      useHoliday: Boolean(useHoliday),
      relContractId: relContractId,
      currency: currency,
      downPayment: Number(downPayment || 0),
      schedule: schedule,
      useManualNumbering: useManualNumbering,
      useFee: useFee,
      loanPurpose: loanPurpose,
      endDate: endDate,
      loanDestination: loanDestination,
    };

    if (leaseType === 'salvage') {
      result.salvageAmount = Number(salvageAmount);
      result.salvagePercent = Number(salvagePercent);
      result.salvageTenor = Number(salvageTenor);
    }

    return result;
  };

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

    if ((e?.target as HTMLInputElement)?.type === 'checkbox')
      value = (e.target as HTMLInputElement).checked;

    const repaymentValue = name === 'repayment' ? value : repayment;

    if (
      (name === 'repayment' && repaymentValue === 'custom') ||
      (repaymentValue === 'custom' &&
        (name === 'tenor' ||
          name === 'leaseAmount' ||
          name === 'customPayment' ||
          name === 'customInterest' ||
          name === 'scheduleDays' ||
          name === 'isPayFirstMonth' ||
          name === 'interestRate' ||
          name === 'startDate')) ||
      name === 'skipAmountCalcMonth'
    ) {
      const tenorValue = Number(name === 'tenor' ? value : tenor);
      const leaseAmountValue = Number(
        name === 'leaseAmount' ? value : leaseAmount,
      );
      const customPaymentValue = Number(
        name === 'customPayment' ? value : customPayment || 0,
      );
      const customInterestValue = Number(
        name === 'customInterest' ? value : customInterest || 0,
      );
      const isPayFirstMonthValue =
        name === 'isPayFirstMonth' ? value : isPayFirstMonth;
      const interestRateValue = name === 'interestRate' ? value : interestRate;
      const startDateValue = name === 'startDate' ? value : startDate;
      const scheduleDaysValue = name === 'scheduleDays' ? value : scheduleDays;
      const skipAmountCalcMonthValue =
        name === 'skipAmountCalcMonth' ? value : skipAmountCalcMonth;

      let schedules: LoanSchedule[] = generateCustomGraphic({
        dateRange: scheduleDaysValue,
        interestRate: interestRateValue,
        leaseAmount: leaseAmountValue,
        startDate: startDateValue,
        tenor: tenorValue,
        customInterest: customInterestValue,
        customPayment: customPaymentValue,
        isPayFirstMonth: isPayFirstMonthValue,
        skipAmountCalcMonth: skipAmountCalcMonthValue,
      });
      setSchedule(schedules);
    }
    if (name === 'interestRate') {
      setInterestRate(Number(value));
      setInterestMonth(Number(value || 0) / 12);
      return;
    }

    name === 'contractNumber' && setContractNumber(value as any);
    name === 'feeAmount' && setFeeAmount(value as any);
    name === 'marginAmount' && setMarginAmount(value as any);
    name === 'loanDestination' && setLoanDestination(value as any);
    name === 'loanPurpose' && setLoanPurpose(value as any);
    name === 'downPayment' && setDownPayment(value as any);
    name === 'isBarter' && setIsBarter(value as any);
    name === 'description' && setDescription(value as any);
    name === 'skipAmountCalcMonth' && setSkipAmountCalcMonth(value as any);
    name === 'leaseAmount' && setLeaseAmount(value as any);
    name === 'repayment' && setRepayment(value as any);
    name === 'tenor' && setTenor(value as any);
    name === 'customPayment' && setCustomPayment(value as any);
    name === 'skipInterestCalcMonth' && setSkipInterestCalcMonth(value as any);
    name === 'commitmentInterest' && setCommitmentInterest(value as any);
    name === 'customInterest' && setCustomInterest(value as any);
    name === 'isPayFirstMonth' && setIsPayFirstMonth(value as any);
  };

  const onSelectTeamMember = (value, name) => {
    setLeasingExpertId(value as any);
  };

  const onSelectContractType = (value) => {
    const contractTypeObj: IContractType = ContractTypeById[value];

    var changingStateValue: any = {
      contractTypeId: value,
      leaseType: (contractTypeObj && contractTypeObj.leaseType) || 'finance',
      commitmentInterest:
        (contractTypeObj && contractTypeObj.commitmentInterest) || 0,
      useMargin: contractTypeObj.useMargin,
      useSkipInterest: contractTypeObj.useSkipInterest,
      useDebt: contractTypeObj.useDebt,
      currency: contractTypeObj.currency,
      config: {
        ...contractTypeObj?.config,
        savingUpperPercent: contractTypeObj.savingUpperPercent,
        savingPlusLoanInterest: contractTypeObj.savingPlusLoanInterest,
      },
      useManualNumbering: contractTypeObj?.useManualNumbering,
      useFee: contractTypeObj?.useFee,
    };

    if (
      contractTypeObj.invoiceDay &&
      contractTypeObj.leaseType === LEASE_TYPES.CREDIT
    ) {
      changingStateValue['scheduleDays'] = [contractTypeObj.invoiceDay];
      setScheduleDays(changingStateValue.scheduleDays);
    }

    if (!unduePercent) {
      changingStateValue['unduePercent'] = contractTypeObj?.unduePercent;
      setUnduePercent(changingStateValue.unduePercent);
    }
    if (!undueCalcType) {
      changingStateValue['undueCalcType'] = contractTypeObj?.undueCalcType;
      setUndueCalcType(changingStateValue.undueCalcType);
    }
    if (!interestMonth && contractTypeObj?.config?.defaultInterest) {
      changingStateValue['interestMonth'] = Number(
        contractTypeObj?.config?.defaultInterest,
      );
      changingStateValue['interestRate'] = Number(
        contractTypeObj?.config?.defaultInterest || 0,
      );
      setInterestMonth(changingStateValue.interestMonth);
      setInterestRate(changingStateValue.interestRate);
    }

    if (!tenor && contractTypeObj?.config?.minTenor) {
      changingStateValue['tenor'] = contractTypeObj?.config?.minTenor;
      setTenor(changingStateValue.tenor);
    }

    if (!leaseAmount && contractTypeObj?.config?.minAmount) {
      changingStateValue['leaseAmount'] = contractTypeObj?.config?.minAmount;
      setLeaseAmount(changingStateValue.leaseAmount);
    }

    setContractTypeId(changingStateValue.contractTypeId);
    setLeaseType(changingStateValue.leaseType);
    setCommitmentInterest(changingStateValue.commitmentInterest);
    setUseMargin(changingStateValue.useMargin);
    setUseSkipInterest(changingStateValue.useSkipInterest);
    setUseDebt(changingStateValue.useDebt);
    setCurrency(changingStateValue.currency);
    setConfig(changingStateValue.config);
    setUseManualNumbering(changingStateValue.useManualNumbering);
    setUseFee(changingStateValue.useManualNumbering);
  };

  const onSelectCustomer = (value) => {
    setCustomerId(value);
  };

  const onCheckCustomerType = (e) => {
    setCustomerType(e.target.checked ? 'company' : 'customer');
  };

  const onFieldClick = (e) => {
    e.target.select();
  };

  const checkValidation = (): any => {
    const errors: any = {};

    function errorWrapper(text: string) {
      return <label style={{ color: 'red' }}>{text}</label>;
    }

    if (
      useMargin &&
      leaseAmount &&
      Number(marginAmount) < Number(leaseAmount)
    ) {
      errors.marginAmount = errorWrapper(
        'Margin Amount can not be less than lease Amount',
      );
    }

    if (
      config &&
      config.minAmount &&
      isGreaterNumber(config.minAmount, leaseAmount)
    ) {
      errors.leaseAmount = errorWrapper(
        `${__('Lease amount must greater than')} ${config.minAmount}`,
      );
    }

    if (
      config &&
      config.maxAmount &&
      isGreaterNumber(leaseAmount, config.maxAmount)
    ) {
      errors.leaseAmount = errorWrapper(
        `${__('Lease amount must less than')} ${config.maxAmount}`,
      );
    }

    if (config && config.minTenor && isGreaterNumber(config.minTenor, tenor)) {
      errors.tenor = errorWrapper(
        `${__('Tenor must greater than')} ${config.minTenor}`,
      );
    }

    if (config && config.maxTenor && isGreaterNumber(tenor, config.maxTenor)) {
      errors.tenor = errorWrapper(
        `${__('Tenor must less than')} ${config.maxTenor}`,
      );
    }

    if (
      config &&
      config.minInterest &&
      isGreaterNumber(config.minInterest, interestRate)
    ) {
      errors.interestRate = errorWrapper(
        `${__('Interest must greater than')} ${
          typeof config.minInterest === 'string'
            ? parseInt(config.minInterest, 10).toFixed(0)
            : config.minInterest.toFixed(0)
        }`,
      );
    }
    if (
      config &&
      config.maxInterest &&
      isGreaterNumber(interestRate, config.maxInterest)
    ) {
      errors.interestRate = errorWrapper(
        `${__('Interest must less than')} ${
          typeof config.maxInterest === 'string'
            ? parseInt(config.maxInterest, 10).toFixed(0)
            : config.maxInterest.toFixed(0)
        }`,
      );
    }

    return errors;
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { values, isSubmitted } = formProps;

    const onChangeBranchId = (value) => {
      setBranchId(value);
    };

    const onChangeContractDate = (value) => {
      setContractDate(value);
    };

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>
              <div style={{ paddingBottom: '13px', paddingTop: '20px' }}>
                {renderFormGroup('Is Organization', {
                  ...formProps,
                  className: 'flex-item',
                  type: 'checkbox',
                  componentClass: 'checkbox',
                  name: 'customerType',
                  checked: customerType === 'company',
                  onChange: onCheckCustomerType,
                })}
              </div>
              {customerType === 'customer' && (
                <FormGroup>
                  <ControlLabel required={true}>{__('Customer')}</ControlLabel>
                  <SelectCustomers
                    label="Choose customer"
                    name="customerId"
                    initialValue={customerId}
                    onSelect={onSelectCustomer}
                    multi={false}
                  />
                </FormGroup>
              )}
              {customerType === 'company' && (
                <FormGroup>
                  <ControlLabel required={true}>{__('Company')}</ControlLabel>
                  <SelectCompanies
                    label="Choose company"
                    name="customerId"
                    initialValue={customerId}
                    onSelect={onSelectCustomer}
                    multi={false}
                  />
                </FormGroup>
              )}
              {useManualNumbering &&
                renderFormGroup('Contract Number', {
                  ...formProps,
                  name: 'contractNumber',
                  value: contractNumber,
                  onChange: onChangeField,
                  onClick: onFieldClick,
                })}

              {useFee &&
                renderFormGroup('Fee Amount', {
                  ...formProps,
                  type: 'number',
                  name: 'feeAmount',
                  useNumberFormat: true,
                  fixed: 2,
                  value: feeAmount || 0,
                  onChange: onChangeField,
                  onClick: onFieldClick,
                })}

              {useMargin &&
                renderFormGroup('Margin Amount', {
                  ...formProps,
                  type: 'number',
                  name: 'marginAmount',
                  useNumberFormat: true,
                  fixed: 2,
                  value: marginAmount || 0,
                  required: true,
                  errors: checkValidation(),
                  onChange: onChangeField,
                  onClick: onFieldClick,
                })}
              {props.currentUser?.configs?.loansConfig?.organizationType ===
                ORGANIZATION_TYPE.BBSB && (
                <FormGroup>
                  <ControlLabel required={true}>{__('Loan Type')}</ControlLabel>
                  <FormControl
                    {...formProps}
                    name="loanDestination"
                    componentClass="select"
                    value={loanDestination}
                    onChange={onChangeField}
                  >
                    {LoanPurpose.destination.map((type, index) => (
                      <option key={index} value={type.code}>
                        {__(type.name)}
                      </option>
                    ))}
                  </FormControl>
                </FormGroup>
              )}
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
                    value={contractDate}
                    onChange={onChangeContractDate}
                  />
                </DateContainer>
              </FormGroup>
              <FormGroup>
                <ControlLabel required={true}>
                  {__('Contract Type')}
                </ControlLabel>
                <SelectContractType
                  label={__('Choose type')}
                  name="contractTypeId"
                  value={contractTypeId || ''}
                  onSelect={onSelectContractType}
                  multi={false}
                ></SelectContractType>
              </FormGroup>
              {props.currentUser?.configs?.loansConfig?.organizationType ===
                ORGANIZATION_TYPE.BBSB && (
                <FormGroup>
                  <ControlLabel required={true}>
                    {__('Loan Purpose')}
                  </ControlLabel>
                  <FormControl
                    {...formProps}
                    name="loanPurpose"
                    componentClass="select"
                    value={loanPurpose}
                    onChange={onChangeField}
                  >
                    {LoanPurpose.purpose
                      .filter((a) =>
                        loanDestination ? a.parent === loanDestination : true,
                      )
                      .map((type, index) => (
                        <option key={index} value={type.name}>
                          {__(type.name)}
                        </option>
                      ))}
                  </FormControl>
                </FormGroup>
              )}
              {useMargin &&
                renderFormGroup('Down payment', {
                  ...formProps,
                  type: 'number',
                  name: 'downPayment',
                  useNumberFormat: true,
                  fixed: 2,
                  value: downPayment || 0,
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
                  initialValue={branchId}
                  onSelect={onChangeBranchId}
                  multi={false}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>{__('Leasing Expert')}</ControlLabel>
                <SelectTeamMembers
                  label={__('Choose an leasing expert')}
                  name="leasingExpertId"
                  initialValue={leasingExpertId}
                  onSelect={onSelectTeamMember}
                  multi={false}
                />
              </FormGroup>
              {useMargin && (
                <div style={{ paddingBottom: '13px', paddingTop: '20px' }}>
                  {renderFormGroup('Is Barter', {
                    ...formProps,
                    className: 'flex-item',
                    type: 'checkbox',
                    componentClass: 'checkbox',
                    name: 'isBarter',
                    checked: isBarter || false,
                    onChange: onChangeField,
                  })}
                </div>
              )}
              {leaseType === LEASE_TYPES.SAVING && (
                <FormGroup>
                  <ControlLabel required={true}>
                    {__('Saving Contract')}
                  </ControlLabel>
                  <SelectSavingContract
                    label={__('Choose an contract')}
                    name="depositAccount"
                    initialValue={savingContractId}
                    filterParams={{
                      isDeposit: false,
                      customerId: customerId,
                    }}
                    onSelect={(v) => {
                      if (typeof v === 'string') {
                        const savingContract = Contracts[v];

                        let changeState: any = {
                          savingContractId: v,
                          endDate: savingContract.endDate,
                        };
                        if (
                          config?.savingUpperPercent &&
                          config?.savingPlusLoanInterest
                        ) {
                          changeState.leaseAmount =
                            (savingContract.savingAmount *
                              config?.savingUpperPercent) /
                            100;
                          changeState.interestRate =
                            savingContract.interestRate +
                            config?.savingPlusLoanInterest;
                          changeState.tenor = dayjs(
                            savingContract.endDate,
                          ).diff(dayjs(startDate ?? new Date()), 'month');
                        }
                        setSavingContractId(changeState.savingContractId);
                        setEndDate(changeState.endDate);
                        setLeaseAmount(changeState.leaseAmount);
                        setInterestRate(changeState.interestRate);
                        setTenor(changeState.tenor);
                      }
                    }}
                    multi={false}
                  />
                </FormGroup>
              )}
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
                  value={description || ''}
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
      setStartDate(value);
    };

    const onSelectScheduleDays = (values) => {
      onChangeField({
        target: { name: 'scheduleDays', value: values.map((val) => val.value) },
      });
    };

    const onChangeRow = (value, key, index) => {
      switch (key) {
        case 'payDate':
          const nDate = new Date(schedule[index - 1]?.payDate ?? startDate);
          schedule[index].payDate = new Date(value);
          schedule[index].diffDay = Number(getDiffDay(nDate, value).toFixed(0));
          if (schedule[index + 1]?.payDate)
            schedule[index + 1].diffDay = Number(
              getDiffDay(
                schedule[index].payDate,
                schedule[index + 1].payDate,
              ).toFixed(0),
            );
          break;
        case 'payment':
          schedule[index].payment = Number(value);
          break;
        case 'interestNonce':
          schedule[index].interestNonce = Number(value);
          break;

        default:
          break;
      }
      setSchedule([...schedule]);
    };

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
                    value={startDate}
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
                value: leaseAmount || 0,
                errors: checkValidation(),
                onChange: onChangeField,
              })}
              {repayment === 'custom' &&
                renderFormGroup('Skip Amount Calc /Month/', {
                  type: 'number',
                  name: 'skipAmountCalcMonth',
                  value: skipAmountCalcMonth,
                  onChange: onChangeField,
                })}
            </FormColumn>
            <FormColumn>
              {leaseType === LEASE_TYPES.FINANCE && (
                <FormGroup>
                  <ControlLabel required={true}>{__('Repayment')}</ControlLabel>
                  <FormControl
                    {...formProps}
                    name="repayment"
                    componentClass="select"
                    value={repayment}
                    onChange={onChangeField}
                  >
                    {['fixed', 'equal', 'custom'].map((typeName, index) => (
                      <option key={index} value={typeName}>
                        {__(typeName + 'Method')}
                      </option>
                    ))}
                  </FormControl>
                </FormGroup>
              )}
              {renderFormGroup('Tenor', {
                type: 'number',
                name: 'tenor',
                useNumberFormat: true,
                value: tenor || 0,
                errors: checkValidation(),
                required: true,
                max: config?.maxTenor,
                onChange: onChangeField,
              })}

              {repayment === 'custom' &&
                renderFormGroup('Custom payment Amount', {
                  type: 'number',
                  name: 'customPayment',
                  useNumberFormat: true,
                  fixed: 2,
                  value: customPayment || 0,
                  onChange: onChangeField,
                })}
              {useSkipInterest &&
                renderFormGroup('Skip Interest Calc /Month/', {
                  type: 'number',
                  name: 'skipInterestCalcMonth',
                  value: skipInterestCalcMonth,
                  onChange: onChangeField,
                })}
              {leaseType === LEASE_TYPES.LINEAR &&
                renderFormGroup('Commitment interest', {
                  ...formProps,
                  type: 'number',
                  useNumberFormat: true,
                  fixed: 2,
                  name: 'commitmentInterest',
                  value: commitmentInterest || 0,
                  errors: checkValidation(),
                  onChange: onChangeField,
                  onClick: onFieldClick,
                })}
            </FormColumn>
            <FormColumn>
              {leaseType === LEASE_TYPES.FINANCE && (
                <FormGroup>
                  <ControlLabel required>{__('Schedule Days')}</ControlLabel>
                  <Select
                    required
                    className="flex-item"
                    placeholder={__('Choose an schedule Days')}
                    value={scheduleDays}
                    onChange={onSelectScheduleDays}
                    multi={true}
                    options={new Array(31).fill(1).map((row, index) => ({
                      value: row + index,
                      label: row + index,
                    }))}
                  />
                </FormGroup>
              )}
              {leaseType === LEASE_TYPES.SAVING && (
                <FormGroup>
                  <ControlLabel required={true}>{__('End Date')}</ControlLabel>
                  <DateContainer>
                    <DateControl
                      {...formProps}
                      required={false}
                      dateFormat="YYYY/MM/DD"
                      name="endDate"
                      value={endDate}
                    />
                  </DateContainer>
                </FormGroup>
              )}
              {renderFormGroup('Interest Rate', {
                ...formProps,
                type: 'number',
                useNumberFormat: true,
                fixed: 2,
                name: 'interestRate',
                value: interestRate || 0,
                errors: checkValidation(),
                onChange: onChangeField,
                onClick: onFieldClick,
              })}
              {repayment === 'custom' &&
                renderFormGroup('Custom Interest', {
                  ...formProps,
                  type: 'number',
                  useNumberFormat: true,
                  fixed: 2,
                  name: 'customInterest',
                  value: customInterest || 0,
                  onChange: onChangeField,
                  onClick: onFieldClick,
                })}
              {leaseType === LEASE_TYPES.FINANCE &&
                renderFormGroup('Is Pay First Month', {
                  className: 'flex-item',
                  type: 'checkbox',
                  componentClass: 'checkbox',
                  name: 'isPayFirstMonth',
                  checked: isPayFirstMonth || false,
                  onChange: onChangeField,
                })}
            </FormColumn>
          </FormWrapper>
          {repayment === 'custom' && (
            <Table striped>
              <thead>
                <tr>
                  <th></th>
                  <th style={{ textAlign: 'center' }}>{__('Day')}</th>
                  <th style={{ textAlign: 'center' }}>{__('Schedule day')}</th>
                  <th style={{ textAlign: 'center' }}>{__('Payment')}</th>
                  <th style={{ textAlign: 'center' }}>{__('Interest')}</th>
                  <th style={{ textAlign: 'center' }}>{__('Total')}</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((mur, rowIndex) => {
                  if (rowIndex === changeRowIndex)
                    return (
                      <tr key={`schedule${mur.order}`}>
                        <td style={{ textAlign: 'center' }}>{mur.order}</td>
                        <td style={{ textAlign: 'center' }}>{mur.diffDay}</td>
                        <td style={{ textAlign: 'center' }}>
                          <DateContainer>
                            <DateControl
                              required={false}
                              name="payDate"
                              dateFormat="YYYY/MM/DD"
                              value={mur.payDate}
                              onChange={(v) =>
                                onChangeRow(v, 'payDate', rowIndex)
                              }
                            />
                          </DateContainer>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {renderFormGroup(undefined, {
                            type: 'number',
                            useNumberFormat: true,
                            fixed: 2,
                            name: 'payment',
                            value: mur.payment || 0,
                            onChange: (e) => {
                              onChangeRow(e.target.value, 'payment', rowIndex);
                            },
                          })}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {renderFormGroup(undefined, {
                            type: 'number',
                            useNumberFormat: true,
                            fixed: 2,
                            name: 'interestNonce',
                            value: mur.interestNonce || 0,
                            onChange: (e) => {
                              onChangeRow(
                                e.target.value,
                                'interestNonce',
                                rowIndex,
                              );
                            },
                          })}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span>{mur.total?.toLocaleString()}</span>
                          <span
                            style={{ marginLeft: 10 }}
                            onClick={() => setChangeRowIndex(undefined)}
                          >
                            <Icon icon="check" />
                          </span>
                        </td>
                      </tr>
                    );
                  return (
                    <tr key={`schedule${mur.order}`}>
                      <td style={{ textAlign: 'center' }}>{mur.order}</td>
                      <td style={{ textAlign: 'center' }}>{mur.diffDay}</td>
                      <td style={{ textAlign: 'center' }}>
                        {mur.payDate.toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {mur.payment?.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {mur.interestNonce?.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span>{mur.total?.toLocaleString()}</span>
                        <span
                          style={{ marginLeft: 10 }}
                          onClick={() => setChangeRowIndex(rowIndex)}
                        >
                          <Icon icon="edit" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td></td>
                  <td></td>
                  <td style={{ textAlign: 'center' }}>{schedule.length}</td>
                  <td style={{ textAlign: 'center' }}>
                    {schedule
                      .reduce((a, b) => a + Number(b.payment), 0)
                      .toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {schedule
                      .reduce((a, b) => a + Number(b.interestNonce || 0), 0)
                      .toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {schedule
                      .reduce((a, b) => a + Number(b.total), 0)
                      .toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </Table>
          )}
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

  if (change) {
    return <Form renderContent={renderGraphic} />;
  }

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
};

export default ContractForm;
