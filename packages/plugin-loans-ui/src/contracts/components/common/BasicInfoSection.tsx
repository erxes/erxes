import Alert from '@erxes/ui/src/utils/Alert';
import Button from '@erxes/ui/src/components/Button';
import confirm from '@erxes/ui/src/utils/confirmation/confirm';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import Icon from '@erxes/ui/src/components/Icon';
import { MainStyleInfoWrapper as InfoWrapper } from '@erxes/ui/src/styles/eindex';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';

import { __ } from 'coreui/utils';
import React, { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

import ContractForm from '../../containers/ContractForm';
import CloseForm from '../../containers/detail/CloseForm';
import InterestChange from '../../containers/detail/InterestChange';
import { Action, Name } from '../../styles';
import { IContract } from '../../types';
import DetailInfo from './DetailInfo';
import { getEnv } from '@erxes/ui/src/utils';
import client from '@erxes/ui/src/apolloClient';
import { gql } from '@apollo/client';
import { queries } from '../../graphql';
import { can, isEnabled } from '@erxes/ui/src/utils/core';
import withConsumer from '../../../withConsumer';
import { IUser } from '@erxes/ui/src/auth/types';

type Props = {
  contract: IContract;
  currentUser: IUser;
  remove: () => void;
};

const BasicInfoSection = (props: Props) => {
  const [documents, setDocuments] = useState([] as any);
  const [loading, setLoading] = useState(false);

  const renderAction = () => {
    const { remove, contract, currentUser } = props;

    const onDelete = () =>
      confirm()
        .then(() => remove())
        .catch((error) => {
          Alert.error(error.message);
        });

    const onOpen = () => {
      if (!isEnabled('documents')) return;
      setLoading(true);
      client
        .mutate({
          mutation: gql(queries.documents),
          variables: { contentType: 'loans' },
        })
        .then(({ data }) => {
          setDocuments(data.documents);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    };

    const onPrint = (mur) => {
      window.open(
        `${getEnv().REACT_APP_API_URL}/pl:documents/print?_id=${
          mur._id
        }&contractId=${contract?._id}`,
      );
    };

    const closeForm = (props) => <CloseForm {...props} contract={contract} />;

    const interestChangeForm = (props) => (
      <InterestChange {...props} contract={contract} />
    );

    const contractForm = (props) => (
      <ContractForm change={true} {...props} contract={contract} />
    );

    return (
      <Action>
        <Dropdown onToggle={(isShown) => isShown && onOpen()}>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-info">
            <Button btnStyle="simple" size="medium">
              {__('Action')}
              <Icon icon="angle-down" />
            </Button>
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {documents?.map((mur) => {
              return (
                <li key={mur._id}>
                  <a href="#print" onClick={() => onPrint(mur)}>
                    {__('Print') + ' ' + mur.name}
                  </a>
                </li>
              );
            })}
            {can('contractsClose', currentUser) && (
              <li>
                <ModalTrigger
                  title={__('To Close Contract')}
                  trigger={<a href="#toClose">{__('To Close Contract')}</a>}
                  size="lg"
                  content={closeForm}
                />
              </li>
            )}
            {can('contractsRemove', currentUser) && (
              <li>
                <a href="#delete" onClick={onDelete}>
                  {__('Delete')}
                </a>
              </li>
            )}
            <li>
              <ModalTrigger
                title={__('Interest correction')}
                trigger={<a href="#toClose">{__('Interest correction')}</a>}
                size="lg"
                content={interestChangeForm}
              />
            </li>
            <li>
              <ModalTrigger
                title={__('Change contract')}
                trigger={<a href="#toClose">{__('Change contract')}</a>}
                size="lg"
                content={contractForm}
              />
            </li>
          </Dropdown.Menu>
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
