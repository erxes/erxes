import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils';
import From from '../components/AccountForm';
import { mutations, queries } from '../graphql';
import { IAccount, IConfigsMap } from '../types';
import { AccountCategoriesQueryResponse } from '@erxes/ui-accounts/src/types';

type Props = {
  account?: IAccount;
  closeModal: () => void;
};

type FinalProps = {
  accountCategoriesQuery: AccountCategoriesQueryResponse;
} & Props;

class AccountFormContainer extends React.Component<FinalProps> {
  render() {
    const { accountCategoriesQuery } = this.props;

    if (accountCategoriesQuery.loading) {
      return null;
    }

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      object
    }: IButtonMutateProps) => {
      const { currency, closePercent, isbalance } = values;
      console.log(values, 'asjdioasdjio');

      values.currency = Number(currency);
      values.closePercent = Number(closePercent);
      values.isbalance = isbalance === 'true' ? true : false;

      return (
        <ButtonMutate
          mutation={object ? mutations.accountEdit : mutations.accountAdd}
          variables={values}
          callback={callback}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          uppercase={false}
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };

    const accountCategories = accountCategoriesQuery.accountCategories || [];

    const configsMap = {};

    const updatedProps = {
      ...this.props,
      renderButton,
      accountCategories,
      configsMap: configsMap || ({} as IConfigsMap)
    };

    return <From {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return [
    'accountDetail',
    'accounts',
    'accountsTotalCount',
    'accountCategories'
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, AccountCategoriesQueryResponse>(
      gql(queries.accountCategories),
      {
        name: 'accountCategoriesQuery'
      }
    )
  )(AccountFormContainer)
);
