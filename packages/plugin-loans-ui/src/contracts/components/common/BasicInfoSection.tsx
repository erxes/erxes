import {
  __,
  Alert,
  Button,
  confirm,
  DropdownToggle,
  Icon,
  MainStyleInfoWrapper as InfoWrapper,
  ModalTrigger,
  Sidebar
} from '@erxes/ui/src';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

import ContractForm from '../../containers/ContractForm';
import CloseForm from '../../containers/detail/CloseForm';
import { Action, Name } from '../../styles';
import { IContract } from '../../types';
import DetailInfo from './DetailInfo';
import { getEnv } from '@erxes/ui/src/utils';
import client from '@erxes/ui/src/apolloClient';
import gql from 'graphql-tag';
import { queries } from '../../graphql';
import { can, isEnabled } from '@erxes/ui/src/utils/core';
import withConsumer from '../../../withConsumer';
import { IUser } from '@erxes/ui/src/auth/types';

type Props = {
  contract: IContract;
  currentUser: IUser;
  remove: () => void;
};

type State = {
  documents: any[];
  loading: boolean;
};

class BasicInfoSection extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      documents: [],
      loading: false
    };
  }

  renderAction() {
    const { remove, contract, currentUser } = this.props;

    const onDelete = () =>
      confirm()
        .then(() => remove())
        .catch(error => {
          Alert.error(error.message);
        });

    const onOpen = () => {
      if (!isEnabled('documents')) return;
      this.setState({ loading: true });
      client
        .mutate({
          mutation: gql(queries.documents),
          variables: { contentType: 'loans' }
        })
        .then(({ data }) => {
          this.setState({ documents: data.documents });
          this.setState({ loading: false });
        })
        .catch(() => {
          this.setState({ loading: false });
        });
    };

    const onPrint = mur => {
      window.open(
        `${getEnv().REACT_APP_API_URL}/pl:documents/print?_id=${
          mur._id
        }&contractId=${contract?._id}`
      );
    };

    const closeForm = props => <CloseForm {...props} contract={contract} />;

    return (
      <Action>
        <Dropdown onToggle={isShown => isShown && onOpen()}>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-info">
            <Button btnStyle="simple" size="medium">
              {__('Action')}
              <Icon icon="angle-down" />
            </Button>
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {this.state.documents?.map(mur => {
              return (
                <li key={mur._id}>
                  <a href="#print" onClick={() => onPrint(mur)}>
                    {__('Print ' + mur.name)}
                  </a>
                </li>
              );
            })}
            {can('contractsClose', currentUser) && (
              <li>
                <ModalTrigger
                  title="To Close Contract"
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
          </Dropdown.Menu>
        </Dropdown>
      </Action>
    );
  }

  render() {
    const { Section } = Sidebar;
    const { contract, currentUser } = this.props;

    const contractForm = props => (
      <ContractForm {...props} contract={contract} />
    );

    return (
      <Sidebar.Section>
        <InfoWrapper>
          <Name>{contract.number}</Name>
          {can('contractsEdit', currentUser) && (
            <ModalTrigger
              title="Edit basic info"
              trigger={<Icon icon="edit" />}
              size="lg"
              content={contractForm}
            />
          )}
        </InfoWrapper>

        {this.renderAction()}

        <Section>
          <DetailInfo contract={contract} />
        </Section>
      </Sidebar.Section>
    );
  }
}

export default withConsumer(BasicInfoSection);
