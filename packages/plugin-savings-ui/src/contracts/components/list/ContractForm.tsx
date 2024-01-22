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
} from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import { DateContainer } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useState } from 'react';
import SelectContractType, {
  ContractTypeById,
} from '../../../contractTypes/containers/SelectContractType';
import { IContract, IContractDoc } from '../../types';
import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';
import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import { IContractType } from '../../../contractTypes/types';
import { IUser } from '@erxes/ui/src/auth/types';
import SelectContracts from '../common/SelectContract';

type Props = {
  currentUser: IUser;
  renderButton: (
    props: IButtonMutateProps & { disabled: boolean },
  ) => JSX.Element;
  contract: IContract;
  closeModal: () => void;
  change?: boolean;
};

function isGreaterNumber(value: any, compareValue: any) {
  value = Number(value || 0);
  compareValue = Number(compareValue || 0);
  return value > compareValue;
}

const ContractForm = (props: Props) => {
  const { contract = {} as IContract } = props;

  const [number, setNumber] = useState(contract.number);
  const [status, setStatus] = useState(contract.status);
  const [branchId, setBranchId] = useState(contract.branchId);
  const [description, setDescription] = useState(contract.description);
  const [savingAmount, setSavingAmount] = useState(contract.savingAmount);
  const [startDate, setStartDate] = useState(contract.startDate);
  const [duration, setDuration] = useState(contract.duration);
  const [interestRate, setInterestRate] = useState(contract.interestRate);
  const [closeInterestRate, setCloseInterestRate] = useState(
    contract.closeInterestRate,
  );
  const [contractTypeId, setContractTypeId] = useState(contract.contractTypeId);
  const [storeInterestInterval, setStoreInterestInterval] = useState(
    contract.storeInterestInterval,
  );
  const [customerId, setCustomerId] = useState(contract.customerId);
  const [customerType, setCustomerType] = useState(contract.customerType);
  const [currency, setCurrency] = useState(
    contract.currency || props.currentUser.configs?.dealCurrency[0],
  );
  const [interestGiveType, setInterestGiveType] = useState(
    contract.interestGiveType,
  );
  const [closeOrExtendConfig, setCloseOrExtendConfig] = useState(
    contract.closeOrExtendConfig,
  );
  const [depositAccount, setDepositAccount] = useState(contract.depositAccount);
  const [interestCalcType, setInterestCalcType] = useState(
    contract.interestCalcType,
  );

  const generateDoc = (values: { _id: string } & IContractDoc) => {
    const finalValues = values;

    if (contract) {
      finalValues._id = contract._id;
    }

    const result = {
      _id: finalValues._id,
      currency,
      contractTypeId,
      interestGiveType,
      closeOrExtendConfig,
      depositAccount,
      number,
      branchId,
      status,
      description,
      createdBy: finalValues.createdBy,
      createdAt: finalValues.createdAt,
      savingAmount: Number(savingAmount),
      startDate,
      duration: Number(duration),
      interestRate: Number(interestRate),
      closeInterestRate: Number(closeInterestRate),
      storeInterestInterval,
      interestCalcType,
      customerId,
      customerType,
    };

    return result;
  };

  const renderFormGroup = (label, props) => {
    return (
      <FormGroup>
        <ControlLabel required={!label.includes('Amount')}>
          {__(label)}
        </ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  };

  const onChangeField = (e) => {
    const name = (e.target as HTMLInputElement).name;
    const value = (e.target as HTMLInputElement).value;
    const setHandler =
      name === 'duration'
        ? setDuration
        : name === 'savingAmount'
          ? setSavingAmount
          : name === 'interestRate'
            ? setInterestRate
            : name === 'closeOrExtendConfig'
              ? setCloseOrExtendConfig
              : name === 'interestGiveType'
                ? setInterestGiveType
                : setDescription;
    setHandler(value as any);
  };

  const onSelectContractType = (value) => {
    const contractTypeObj: IContractType = ContractTypeById[value];

    var changingStateValue: any = { contractTypeId: value };

    //get default value from contract type
    changingStateValue['interestRate'] = Number(contractTypeObj?.interestRate);
    changingStateValue['closeInterestRate'] = Number(
      contractTypeObj?.closeInterestRate,
    );
    changingStateValue['storeInterestInterval'] =
      contractTypeObj?.storeInterestInterval;
    changingStateValue['interestCalcType'] = contractTypeObj?.interestCalcType;
    changingStateValue['isAllowIncome'] = contractTypeObj?.isAllowIncome;
    changingStateValue['isAllowOutcome'] = contractTypeObj?.isAllowOutcome;
    changingStateValue['isDeposit'] = contractTypeObj?.isDeposit;

    if (!duration && contractTypeObj?.config?.minDuration) {
      changingStateValue['duration'] = contractTypeObj?.config?.minDuration;
    }

    setInterestRate(changingStateValue['interestRate']);
    setCloseInterestRate(changingStateValue['closeInterestRate']);
    setContractTypeId(changingStateValue['contractTypeId']);
    setStoreInterestInterval(changingStateValue['storeInterestInterval']);
    setInterestCalcType(changingStateValue['interestCalcType']);
    setDuration(changingStateValue['duration']);
  };

  const onSelectCustomer = (value) => {
    setCustomerId(value);
  };

  const onCheckCustomerType = (e) => {
    setCustomerType(e.target.checked ? 'company' : 'customer');
  };

  const checkValidation = (): any => {
    const errors: any = {};

    function errorWrapper(text: string) {
      return <label style={{ color: 'red' }}>{text}</label>;
    }

    return errors;
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton, change } = props;
    const { values, isSubmitted } = formProps;

    const onChangeStartDate = (value) => {
      setStartDate(value);
    };

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            {!change && (
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
                    <ControlLabel required={true}>
                      {__('Customer')}
                    </ControlLabel>
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
              </FormColumn>
            )}
            {!change && (
              <FormColumn>
                <FormGroup>
                  <ControlLabel required={true}>
                    {__('Start Date')}
                  </ControlLabel>
                  <DateContainer>
                    <DateControl
                      {...formProps}
                      dateFormat="YYYY/MM/DD"
                      required={false}
                      name="startDate"
                      value={startDate}
                      onChange={onChangeStartDate}
                    />
                  </DateContainer>
                </FormGroup>
                {renderFormGroup('Duration', {
                  ...formProps,
                  className: 'flex-item',
                  type: 'number',
                  useNumberFormat: true,
                  name: 'duration',
                  value: duration,
                  onChange: onChangeField,
                })}
                {renderFormGroup('Saving Amount', {
                  ...formProps,
                  className: 'flex-item',
                  type: 'number',
                  useNumberFormat: true,
                  name: 'savingAmount',
                  value: savingAmount,
                  onChange: onChangeField,
                })}
              </FormColumn>
            )}
            <FormColumn>
              {renderFormGroup('Interest Rate', {
                ...formProps,
                className: 'flex-item',
                type: 'number',
                useNumberFormat: true,
                name: 'interestRate',
                value: interestRate,
                onChange: onChangeField,
              })}

              <FormGroup>
                <ControlLabel required={true}>
                  {__('Close or extend of time')}
                </ControlLabel>
                <FormControl
                  {...props}
                  name="closeOrExtendConfig"
                  componentClass="select"
                  value={closeOrExtendConfig}
                  required={true}
                  onChange={onChangeField}
                >
                  {['closeEndOfContract', 'autoExtend'].map(
                    (typeName, index) => (
                      <option key={index} value={typeName}>
                        {__(typeName)}
                      </option>
                    ),
                  )}
                </FormControl>
              </FormGroup>
              <FormGroup>
                <ControlLabel required={true}>
                  {__('Interest give type')}
                </ControlLabel>
                <FormControl
                  {...props}
                  name="interestGiveType"
                  componentClass="select"
                  value={interestGiveType}
                  required={true}
                  onChange={onChangeField}
                >
                  {['currentAccount', 'depositAccount'].map(
                    (typeName, index) => (
                      <option key={index} value={typeName}>
                        {__(typeName)}
                      </option>
                    ),
                  )}
                </FormControl>
              </FormGroup>
              {interestGiveType === 'depositAccount' && (
                <FormGroup>
                  <ControlLabel>{__('Deposit account')}</ControlLabel>
                  <SelectContracts
                    label={__('Choose an contract')}
                    name="depositAccount"
                    initialValue={depositAccount}
                    filterParams={{ isDeposit: true }}
                    onSelect={(v) => {
                      if (typeof v === 'string') {
                        setDepositAccount(v);
                      }
                    }}
                    multi={false}
                  />
                </FormGroup>
              )}
            </FormColumn>
          </FormWrapper>
          {!change && (
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

  return <Form renderContent={renderContent} />;
};

export default ContractForm;
