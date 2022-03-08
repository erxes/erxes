import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Info from '@erxes/ui/src/components/Info';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IFormProps } from '@erxes/ui/src/types';
import { Alert, getEnv, withProps } from '@erxes/ui/src/utils';
import {
  mutations,
  queries
} from '@erxes/ui-settings/src/integrations/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import Accounts from '../components/Accounts';
import {
  AccountsQueryResponse,
  IntegrationTypes,
  RemoveAccountMutationResponse
} from '@erxes/ui-inbox/src/settings/integrations/types';

type Props = {
  kind: IntegrationTypes;
  addLink: string;
  onSelect: (accountId?: string) => void;
  onRemove: (accountId: string) => void;
  formProps?: IFormProps;
  renderForm?: () => JSX.Element;
};

type FinalProps = {
  integrationsAccountsQuery: AccountsQueryResponse;
} & Props &
  RemoveAccountMutationResponse;

class AccountContainer extends React.Component<FinalProps, {}> {
  popupWindow(url, title, win, w, h) {
    const y = win.top.outerHeight / 2 + win.top.screenY - h / 2;
    const x = win.top.outerWidth / 2 + win.top.screenX - w / 2;

    return win.open(
      url,
      title,
      `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${w}, height=${h}, top=${y}, left=${x}`
    );
  }

  onAdd = () => {
    const { addLink, kind } = this.props;

    const { REACT_APP_API_URL } = getEnv();
    const url = `${REACT_APP_API_URL}/connect-integration?link=${addLink}&kind=${kind}`;

    this.popupWindow(url, 'Integration', window, 660, 750);
  };

  removeAccount = (accountId: string) => {
    const { removeAccount, onRemove } = this.props;

    removeAccount({ variables: { _id: accountId } })
      .then(() => {
        Alert.success('You successfully removed an account');
        onRemove(accountId);
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  render() {
    const { kind, renderForm, integrationsAccountsQuery, onSelect, formProps } = this.props;

    if (integrationsAccountsQuery.loading) {
      return <Spinner objective={true} />;
    }

    if (integrationsAccountsQuery.error) {
      return <Info>{integrationsAccountsQuery.error.message}</Info>;
    }

    const accounts = integrationsAccountsQuery.integrationsGetAccounts || [];

    return (
      <Accounts
        kind={kind}
        onAdd={this.onAdd}
        removeAccount={this.removeAccount}
        onSelect={onSelect}
        accounts={accounts}
        formProps={formProps}
        renderForm={renderForm}
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, RemoveAccountMutationResponse, { _id: string }>(
      gql(mutations.removeAccount),
      {
        name: 'removeAccount',
        options: {
          refetchQueries: ['integrationsGetAccounts']
        }
      }
    ),
    graphql<Props, AccountsQueryResponse>(gql(queries.integrationsGetAccounts), {
      name: 'integrationsAccountsQuery',
      options: ({ kind }) => ({
        variables: {
          kind
        }
      })
    })
  )(AccountContainer)
);
