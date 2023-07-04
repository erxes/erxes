import queryString from 'query-string';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';

import Chooser from '@erxes/ui/src/components/Chooser';
import { Alert, withProps } from '@erxes/ui/src/utils';
import AccountCategoryChooser from '../components/AccountCategoryChooser';
import {
  mutations as accountMutations,
  queries as accountQueries
} from '../graphql';
import {
  IAccount,
  IAccountDoc,
  AccountAddMutationResponse,
  AccountsQueryResponse
} from '../types';
import AccountForm from './AccountForm';
import { AccountCategoriesQueryResponse } from '@erxes/ui-accounts/src/types';
import { isEnabled } from '@erxes/ui/src/utils/core';

type Props = {
  data: { name: string; accounts: IAccount[] };
  categoryId: string;
  onChangeCategory: (categoryId: string) => void;
  closeModal: () => void;
  onSelect: (accounts: IAccount[]) => void;
  loadDiscountPercent?: (accountsData: any) => void;
};

type FinalProps = {
  accountsQuery: AccountsQueryResponse;
  accountCategoriesQuery: AccountCategoriesQueryResponse;
} & Props &
  AccountAddMutationResponse;

class AccountChooser extends React.Component<FinalProps, { perPage: number }> {
  constructor(props) {
    super(props);

    this.state = { perPage: 20 };
  }

  search = (value: string, reload?: boolean) => {
    if (!reload) {
      this.setState({ perPage: 0 });
    }

    this.setState({ perPage: this.state.perPage + 20 }, () =>
      this.props.accountsQuery.refetch({
        searchValue: value,
        perPage: this.state.perPage
      })
    );
  };

  // add account
  addAccount = (doc: IAccountDoc, callback: () => void) => {
    this.props
      .accountAdd({
        variables: doc
      })
      .then(() => {
        this.props.accountsQuery.refetch();

        Alert.success('You successfully added a account or service');

        callback();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  renderAccountCategoryChooser = () => {
    const { accountCategoriesQuery, onChangeCategory } = this.props;

    return (
      <AccountCategoryChooser
        categories={accountCategoriesQuery.accountCategories || []}
        onChangeCategory={onChangeCategory}
      />
    );
  };

  renderDiscount = data => {
    const { loadDiscountPercent } = this.props;
    if (isEnabled('loyalties') && loadDiscountPercent && data) {
      const accountData = {
        account: {
          _id: data._id
        },
        quantity: 1
      };
      loadDiscountPercent(accountData);
    }
  };

  render() {
    const { data, accountsQuery, onSelect } = this.props;

    const updatedProps = {
      ...this.props,
      data: { name: data.name, datas: data.accounts },
      search: this.search,
      title: 'Account',
      renderForm: ({ closeModal }: { closeModal: () => void }) => (
        <AccountForm closeModal={closeModal} />
      ),
      perPage: this.state.perPage,
      add: this.addAccount,
      clearState: () => this.search('', true),
      datas: accountsQuery.accounts || [],
      onSelect
    };

    return (
      <Chooser
        {...updatedProps}
        renderFilter={this.renderAccountCategoryChooser}
        handleExtra={this.renderDiscount}
        modalSize="xl"
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<
      { categoryId: string },
      AccountsQueryResponse,
      { perPage: number; categoryId: string }
    >(gql(accountQueries.accounts), {
      name: 'accountsQuery',
      options: props => ({
        variables: {
          perPage: 20,
          categoryId: props.categoryId,
          pipelineId: queryString.parse(location.search).pipelineId,
          boardId: queryString.parse(location.search).boardId
        },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<{}, AccountCategoriesQueryResponse, {}>(
      gql(accountQueries.accountCategories),
      {
        name: 'accountCategoriesQuery'
      }
    ),
    // mutations
    graphql<{}, AccountAddMutationResponse, IAccount>(
      gql(accountMutations.accountAdd),
      {
        name: 'accountAdd',
        options: () => ({
          refetchQueries: [
            {
              query: gql(accountQueries.accounts),
              variables: { perPage: 20 }
            }
          ]
        })
      }
    )
  )(AccountChooser)
);
