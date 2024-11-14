import { Action, Name } from '../../styles';
import React, { useState } from 'react';
import { can, isEnabled } from '@erxes/ui/src/utils/core';

import Alert from '@erxes/ui/src/utils/Alert';
import Button from '@erxes/ui/src/components/Button';
import CloseForm from '../../containers/detail/CloseForm';
import ContractForm from '../../containers/ContractForm';
import DetailInfo from './DetailInfo';
import Dropdown from '@erxes/ui/src/components/Dropdown';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import { IContract } from '../../types';
import { IUser } from '@erxes/ui/src/auth/types';
import Icon from '@erxes/ui/src/components/Icon';
import { MainStyleInfoWrapper as InfoWrapper } from '@erxes/ui/src/styles/eindex';
import InterestChange from '../../containers/detail/InterestChange';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { __ } from 'coreui/utils';
import client from '@erxes/ui/src/apolloClient';
import confirm from '@erxes/ui/src/utils/confirmation/confirm';
import { getEnv } from '@erxes/ui/src/utils';
import { gql } from '@apollo/client';
import { queries } from '../../graphql';
import withConsumer from '../../../withConsumer';
import TransactionForm from '../../../transactions/containers/TransactionForm';

type Props = {
  contract: IContract;
  currentUser: IUser;
  remove: () => void;
};

const BasicInfoSection = (props: Props) => {
  const [documents, setDocuments] = useState([] as any);

  const renderAction = () => {
    const { remove, contract, currentUser } = props;

    const onDelete = () =>
      confirm()
        .then(() => remove())
        .catch((error) => {
          Alert.error(error.message);
        });

    const onOpen = () => {
      if (!isEnabled('documents') || documents.length > 0) return;
      client
        .mutate({
          mutation: gql(queries.documents),
          variables: { contentType: 'loans' }
        })
        .then(({ data }) => {
          setDocuments(data.documents);
        });
    };

    const onPrint = (mur) => {
      window.open(
        `${getEnv().REACT_APP_API_URL}/pl:documents/print?_id=${mur._id
        }&contractId=${contract?._id}`
      );
    };

    const closeForm = (props) => <CloseForm {...props} contract={contract} />;
    const giveTrForm = (props) => {
      return <TransactionForm {...props} type="give" contractId={contract._id} lockContract={true} />;
    };
    const repaymentTrForm = (props) => {
      return <TransactionForm {...props} type="repayment" contractId={contract._id} lockContract={true} />;
    };

    const interestChangeForm = (props) => (
      <InterestChange {...props} contract={contract} />
    );

    const contractForm = (props) => (
      <ContractForm change={true} {...props} contract={contract} />
    );

    const menuItems = () => {
      let result: any[] = [
        {
          title: 'Interest correction',
          trigger: <a href="#toClose">{__('Interest correction')}</a>,
          content: interestChangeForm,
          additionalModalProps: { size: 'lg' }
        },
        {
          title: 'Change contract',
          trigger: <a href="#changeContract">{__('Change contract')}</a>,
          content: contractForm,
          additionalModalProps: { size: 'lg' }
        }
      ];
      if (can('contractsClose', currentUser))
        result.push({
          title: 'To Close Contract',
          trigger: <a href="#toClose">{__('To Close Contract')}</a>,
          content: closeForm,
          additionalModalProps: { size: 'lg' }
        });

      if (!contract.loanBalanceAmount && !contract.givenAmount) {
        result.unshift({
          title: 'Give transaction',
          trigger: <a href="#toClose">{__('Give transaction')}</a>,
          content: giveTrForm,
          additionalModalProps: { size: 'lg' }
        })
      } else {
        result.unshift({
          title: 'Repayment Transaction',
          trigger: <a href="#toClose">{__('Repayment Transaction')}</a>,
          content: repaymentTrForm,
          additionalModalProps: { size: 'lg' }
        })
      }
      return result;
    };

    return (
      <Action>
        <Dropdown
          as={DropdownToggle}
          toggleComponent={
            <Button btnStyle="simple" size="medium" onClick={onOpen}>
              {__('Action')}
              <Icon icon="angle-down" />
            </Button>
          }
          modalMenuItems={menuItems()}
        >
          {documents?.map((mur) => {
            return (
              <li key={mur._id}>
                <a href="#print" onClick={() => onPrint(mur)}>
                  {__('Print') + ' ' + mur.name}
                </a>
              </li>
            );
          })}
          {can('contractsRemove', currentUser) && (
            <li>
              <a href="#delete" onClick={onDelete}>
                {__('Delete')}
              </a>
            </li>
          )}
        </Dropdown>
      </Action>
    );
  };

  const { Section } = Sidebar;
  const { contract, currentUser } = props;

  const contractForm = (props) => (
    <ContractForm {...props} contract={contract} />
  );

  return (
    <Sidebar.Section>
      <InfoWrapper>
        <Name>{contract.number}</Name>
        {can('contractsEdit', currentUser) && (
          <ModalTrigger
            title={__('Edit basic info')}
            trigger={<Icon icon="edit" />}
            size="lg"
            content={contractForm}
          />
        )}
      </InfoWrapper>

      {renderAction()}

      <Section>
        <DetailInfo contract={contract} />
      </Section>
    </Sidebar.Section>
  );
};

export default withConsumer(BasicInfoSection);
