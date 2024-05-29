import {
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper,
} from '@erxes/ui/src/styles/eindex';
import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import DateControl from '@erxes/ui/src/components/form/DateControl';

import { __ } from 'coreui/utils';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useState } from 'react';
import moment from 'moment';
import { IContract } from '../../types';

import { IUser } from '@erxes/ui/src/auth/types';
import { DateContainer } from '@erxes/ui/src/styles/main';
import { IContractType } from '../../../contractTypes/types';

type Props = {
  currentUser: IUser;
  contractTypes: IContractType[];
  renderButton: (
    props: IButtonMutateProps & { disabled: boolean },
  ) => JSX.Element;
  contracts: IContract[];
  closeModal: () => void;
};

const StoreInterestForm = (props: Props) => {
  const generateDoc = () => {
    return [];
  };

  const checkValidation = (): any => {
    const errors: any = {};

    return errors;
  };

  const renderStoreInterestList = () => {
    return (
      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>{__('number')}</th>
            <th>{__('last stored date')}</th>
            <th>{__('days')}</th>
            <th>{__('storing interest')}</th>
          </tr>
        </thead>
        <tbody
          style={{
            boxShadow: '1px 0px 5px rgba(0,0,0,0.1)',
            columnSpan: 'all',
          }}
        >
          {props.contracts.map((mur) => {
            return (
              <tr key={mur._id}>
                <td style={{ fontSize: 'bold' }}>{mur.number}</td>
                <td>
                  {moment(mur.lastStoredDate || undefined).format('YYYY/MM/DD')}
                </td>
                <td>{mur.expiredDays}</td>
                <td>{mur.interestNounce}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { isSubmitted } = formProps;

    return (
      <>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>
                {__('Transaction Date')}
              </ControlLabel>
              <DateContainer>
                <DateControl
                  {...formProps}
                  dateFormat="YYYY/MM/DD"
                  required={false}
                  name="startDate"
                />
              </DateContainer>
            </FormGroup>
          </FormColumn>
        </FormWrapper>
        <ScrollWrapper>{renderStoreInterestList()}</ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__('Close')}
          </Button>

          {renderButton({
            name: 'contract',
            values: generateDoc(),
            disabled: !!Object.keys(checkValidation())?.length,
            isSubmitted,
            object: props.contracts,
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default StoreInterestForm;
