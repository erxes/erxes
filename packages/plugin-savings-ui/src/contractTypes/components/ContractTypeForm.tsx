import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
} from '@erxes/ui/src';
import { IProductCategory } from '@erxes/ui-products/src/types';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useState } from 'react';
import { __ } from 'coreui/utils';

import { IContractType, IContractTypeDoc } from '../types';
import { IUser } from '@erxes/ui/src/auth/types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  contractType: IContractType;
  closeModal: () => void;
  currentUser: IUser;
};

const ContractTypeForm = (props: Props) => {
  const { contractType = {} as IContractType } = props;

  const [code, setCode] = useState(contractType.code);
  const [name, setName] = useState(contractType.name);
  const [description, setDescription] = useState(contractType.description);
  const [status, setStatus] = useState(contractType.status);
  const [number, setNumber] = useState(contractType.number);
  const [vacancy, setVacancy] = useState(contractType.vacancy);
  const [branchId, setBranchId] = useState(contractType.branchId);
  const [interestCalcType, setInterestCalcType] = useState(
    contractType.interestCalcType,
  );
  const [storeInterestInterval, setStoreInterestInterval] = useState(
    contractType.storeInterestInterval,
  );
  const [isAllowIncome, setIsAllowIncome] = useState(
    contractType.isAllowIncome,
  );
  const [isAllowOutcome, setIsAllowOutcome] = useState(
    contractType.isAllowOutcome,
  );
  const [isDeposit, setIsDeposit] = useState(contractType.isDeposit);
  const [interestRate, setInterestRate] = useState(contractType.interestRate);
  const [closeInterestRate, setCloseInterestRate] = useState(
    contractType.closeInterestRate,
  );
  const [currency, setCurrency] = useState(
    contractType.currency || props.currentUser.configs?.dealCurrency[0],
  );

  const generateDoc = (values: { _id: string } & IContractTypeDoc) => {
    const finalValues = values;

    if (contractType) {
      finalValues._id = contractType._id;
    }

    return {
      _id: finalValues._id,
      code: finalValues.code,
      name: finalValues.name,
      number: finalValues.number,
      vacancy: Number(finalValues.vacancy),
      isAllowIncome,
      isAllowOutcome,
      isDeposit,
      interestCalcType,
      storeInterestInterval,
      description: finalValues.description,
      currency: finalValues.currency,
      interestRate: Number(finalValues.interestRate),
      closeInterestRate: Number(finalValues.closeInterestRate),
      branchId: finalValues.branchId,
      status: finalValues.status,
    } as IContractTypeDoc;
  };

  const renderFormGroup = (label, props) => {
    if (props.type === 'checkbox')
      return (
        <FormGroup>
          <FormControl {...props} />
          <ControlLabel required={props.required}>{__(label)}</ControlLabel>
        </FormGroup>
      );
    return (
      <FormGroup>
        <ControlLabel required={props.required}>{__(label)}</ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  };

  const onChangeField = (e) => {
    const name = (e.target as HTMLInputElement).name;
    const value =
      e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : (e.target as HTMLInputElement).value;
    const setHandler =
      name === 'currency'
        ? setCurrency
        : name === 'storeInterestInterval'
          ? setStoreInterestInterval
          : name === 'interestCalcType'
            ? setInterestCalcType
            : name === 'interestRate'
              ? setInterestRate
              : name === 'closeInterestRate'
                ? setCloseInterestRate
                : name === 'isAllowIncome'
                  ? setIsAllowIncome
                  : name === 'isDeposit'
                    ? setIsDeposit
                    : setIsAllowOutcome;

    setHandler(value as any);
  };

  const renderContent = (formProps: IFormProps) => {
    const contractType = props.contractType || ({} as IContractType);
    const { closeModal, renderButton } = props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>
              {renderFormGroup('Code', {
                ...formProps,
                name: 'code',
                required: true,
                defaultValue: contractType.code || '',
              })}
              {renderFormGroup('Name', {
                ...formProps,
                name: 'name',
                required: true,
                defaultValue: contractType.name || '',
              })}
              {renderFormGroup('Start Number', {
                ...formProps,
                name: 'number',
                required: true,
                defaultValue: contractType.number || '',
              })}
              {renderFormGroup('After vacancy count', {
                ...formProps,
                name: 'vacancy',
                required: true,
                type: 'number',
                defaultValue: contractType.vacancy || 1,
                max: 20,
              })}
              <FormGroup>
                <ControlLabel required={true}>{__('Currency')}</ControlLabel>
                <FormControl
                  {...formProps}
                  name="currency"
                  componentClass="select"
                  value={currency}
                  required={true}
                  onChange={onChangeField}
                >
                  {props.currentUser.configs?.dealCurrency?.map(
                    (typeName, index) => (
                      <option key={index} value={typeName}>
                        {typeName}
                      </option>
                    ),
                  )}
                </FormControl>
              </FormGroup>
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel>{__('Store interest interval')}:</ControlLabel>

                <FormControl
                  {...props}
                  name="storeInterestInterval"
                  componentClass="select"
                  value={storeInterestInterval}
                  required={true}
                  onChange={onChangeField}
                >
                  {['daily', 'montly', 'endOfMonth', 'endOfContract'].map(
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
                  {__('Interest calc type')}
                </ControlLabel>
                <FormControl
                  {...formProps}
                  name="interestCalcType"
                  componentClass="select"
                  value={interestCalcType}
                  required={true}
                  onChange={onChangeField}
                >
                  {[
                    'Сар бүр /ХХОАТ суутгана/',
                    'Хугацааны эцэст /ХХОАТ суутгана/',
                  ].map((typeName, index) => (
                    <option key={`interetCalcType${index}`} value={typeName}>
                      {__(typeName)}
                    </option>
                  ))}
                </FormControl>
              </FormGroup>
              {renderFormGroup('Interest Rate', {
                ...formProps,
                className: 'flex-item',
                type: 'number',
                useNumberFormat: true,
                name: 'interestRate',
                value: interestRate,
                onChange: onChangeField,
              })}
              {renderFormGroup('Close Interest Rate', {
                ...formProps,
                className: 'flex-item',
                type: 'number',
                useNumberFormat: true,
                name: 'closeInterestRate',
                value: closeInterestRate,
                onChange: onChangeField,
              })}
              {renderFormGroup('Is allow income', {
                ...formProps,
                className: 'flex-item',
                type: 'checkbox',
                componentClass: 'checkbox',
                name: 'isAllowIncome',
                checked: isAllowIncome,
                onChange: onChangeField,
              })}
              {renderFormGroup('Is Deposit', {
                ...formProps,
                className: 'flex-item',
                type: 'checkbox',
                componentClass: 'checkbox',
                name: 'isDeposit',
                checked: isDeposit,
                onChange: onChangeField,
              })}
              {isDeposit &&
                renderFormGroup('Is allow outcome', {
                  ...formProps,
                  className: 'flex-item',
                  type: 'checkbox',
                  componentClass: 'checkbox',
                  name: 'isAllowOutcome',
                  checked: isAllowOutcome,
                  onChange: onChangeField,
                })}
            </FormColumn>
          </FormWrapper>
          <FormWrapper>
            <FormColumn>
              {renderFormGroup('Description', {
                ...formProps,
                name: 'description',
                max: 140,
                componentClass: 'textarea',
                defaultValue: contractType.description || '',
              })}
            </FormColumn>
          </FormWrapper>
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__('Close')}
          </Button>

          {renderButton({
            name: 'contractType',
            values: generateDoc(values),
            isSubmitted,
            object: props.contractType,
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default ContractTypeForm;
