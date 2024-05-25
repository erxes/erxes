import {
  Button,
  ButtonMutate,
  ControlLabel,
  Form,
  MainStyleFormColumn as FormColumn,
  FormControl,
  FormGroup,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper
} from '@erxes/ui/src';
import { ITransaction, ITransactionDoc } from '../types';
import React, { useState } from 'react';
import { mutations, queries } from '../graphql';

import { Amount } from '../../contracts/styles';
import { IFormProps } from '@erxes/ui/src/types';
import { IInvoice } from '../../invoices/types';
import { __ } from 'coreui/utils';
import client from '@erxes/ui/src/apolloClient';
import { gql } from '@apollo/client';

type Props = {
  transaction: ITransaction;
  invoice?: IInvoice;
  closeModal: () => void;
  isGotEBarimt: boolean;
};

const EBarimtForm = (props: Props) => {
  const { transaction = {} as ITransaction } = props;

  const [isGetEBarimt, setIsGetEBarimt] = useState(false);
  const [isOrganization, setIsOrganization] = useState(false);
  const [organizationRegister, setOrganizationRegister] = useState('');
  const [organizationName, setOrganizationName] = useState('');

  const generateDoc = (values: { _id: string } & ITransactionDoc) => {
    const finalValues = values;

    if (transaction && transaction._id) {
      finalValues._id = transaction._id;
    }

    return {
      id: finalValues._id,
      companyId: transaction.companyId,
      contractId: transaction.contractId,
      invoiceId: transaction.invoiceId,
      description: transaction.description,
      invoice: transaction.invoice,
      customerId: transaction.customerId,
      isGetEBarimt,
      organizationRegister,
      organizationName,
      isOrganization,
      isManual: true,
      payDate: finalValues.payDate,
      total: Number(transaction.total)
    };
  };

  const onFieldClick = (e) => {
    e.target.select();
  };

  const renderRowTr = (label, val) => {
    return (
      <FormWrapper>
        <FormColumn>
          <ControlLabel>{`${__(label)}:`}</ControlLabel>
        </FormColumn>
        <FormColumn>
          <Amount>{Number(val).toLocaleString()}</Amount>
        </FormColumn>
      </FormWrapper>
    );
  };

  const renderButton = ({ name, values, isSubmitted, object }: any) => {
    const { closeModal } = props;

    const afterSave = () => {
      closeModal();
    };

    return (
      <ButtonMutate
        mutation={mutations.createEBarimtOnTransaction}
        variables={values}
        callback={afterSave}
        refetchQueries={['transactionsMain']}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      >
        {__('Get')}
      </ButtonMutate>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal } = props;
    const { values, isSubmitted } = formProps;

    const getCompanyName = (register) => {
      if (register && register.length === 7)
        client
          .query({
            query: gql(queries.getCompanyName),
            variables: { companyRd: register }
          })
          .then(({ data }) => {
            data?.ebarimtGetCompany?.info;
            setOrganizationName(data?.ebarimtGetCompany?.info?.name);
          });
    };

    const onChangeField = (e) => {
      if (
        (e.target as HTMLInputElement).name === 'organizationRegister' &&
        isOrganization &&
        isGetEBarimt
      ) {
        if ((e.target as HTMLInputElement).value.length > 7) return;
        if ((e.target as HTMLInputElement).value.length < 7) {
          setOrganizationName('');
        }
        getCompanyName((e.target as HTMLInputElement).value);
      }
      const value =
        e.target.type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : (e.target as HTMLInputElement).value;
      const name = (e.target as HTMLInputElement).name;
      if (name === 'isGetEBarimt') {
        setIsGetEBarimt(value as any);
      }
      if (name === 'isOrganization') {
        setIsOrganization(value as any);
      }
      if (name === 'organizationRegister') {
        setOrganizationRegister(value as any);
      }
    };

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>
              {renderRowTr('Total', transaction.total)}
              {!props.isGotEBarimt && (
                <FormGroup>
                  <ControlLabel>{__('Is get E-Barimt')}</ControlLabel>
                  <FormControl
                    {...formProps}
                    type={'checkbox'}
                    componentclass="checkbox"
                    useNumberFormat
                    fixed={0}
                    name="isGetEBarimt"
                    value={isGetEBarimt}
                    onChange={onChangeField}
                    onClick={onFieldClick}
                  />
                </FormGroup>
              )}
              {isGetEBarimt && (
                <FormGroup>
                  <ControlLabel>{__('Is organization')}</ControlLabel>
                  <FormControl
                    {...formProps}
                    type={'checkbox'}
                    componentclass="checkbox"
                    useNumberFormat
                    fixed={0}
                    name="isOrganization"
                    value={isOrganization}
                    onChange={onChangeField}
                    onClick={onFieldClick}
                  />
                </FormGroup>
              )}
              {isGetEBarimt && isOrganization && (
                <FormWrapper>
                  <FormColumn>
                    <FormGroup>
                      <ControlLabel>{__('Organization Register')}</ControlLabel>
                      <FormControl
                        {...formProps}
                        type={'number'}
                        fixed={2}
                        name="organizationRegister"
                        value={organizationRegister}
                        onChange={onChangeField}
                        onClick={onFieldClick}
                      />
                    </FormGroup>
                  </FormColumn>
                  <FormColumn>
                    <FormGroup>
                      <ControlLabel>{__('Organization Name')}</ControlLabel>
                      <FormControl
                        {...formProps}
                        disabled
                        maxLength={7}
                        value={organizationName}
                      />
                    </FormGroup>
                  </FormColumn>
                </FormWrapper>
              )}
            </FormColumn>
          </FormWrapper>
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__('Close')}
          </Button>

          {!props.isGotEBarimt &&
            renderButton({
              name: 'transaction',
              values: generateDoc(values),
              isSubmitted,
              object: transaction
            })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default EBarimtForm;
