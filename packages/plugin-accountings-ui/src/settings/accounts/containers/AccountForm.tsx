import { AppConsumer } from "coreui/appContext";
import { gql, useQuery } from "@apollo/client";
import { Spinner } from "@erxes/ui/src";
import ButtonMutate from "@erxes/ui/src/components/ButtonMutate";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import React from "react";
import Form from "../components/AccountForm";
import { mutations, queries } from "../graphql";
import { AccountCategoriesQueryResponse, AccountDetailQueryResponse } from "../types";

type Props = {
  accountId?: string;
  queryParams: any;
  closeModal: () => void;
};

const AccountFormContainer = (props: Props) => {
  const { accountId } = props;

  const accountDetailQuery = useQuery<AccountDetailQueryResponse>(
    gql(queries.accountDetail),
    {
      skip: !accountId,
      fetchPolicy: "network-only",
      variables: {
        _id: accountId || "",
        accountId: accountId || "",
      },
    }
  );

  const accountCategoriesQuery = useQuery<AccountCategoriesQueryResponse>(
    gql(queries.accountCategories),
    {
      fetchPolicy: "cache-and-network"
    }
  );

  if (
    (accountDetailQuery && accountDetailQuery.loading) ||
    (accountCategoriesQuery && accountCategoriesQuery.loading)
  ) {
    return <Spinner objective={true} />;
  }

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object,
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.accountsEdit : mutations.accountsAdd}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        uppercase={false}
        successMessage={`You successfully ${object ? "updated" : "added"
          } a ${name}`}
      />
    );
  };

  const account = accountDetailQuery?.data?.accountDetail;
  const accountCategories = (accountCategoriesQuery?.data?.accountCategories) || [];

  const updatedProps = {
    ...props,
    account,
    renderButton,
    accountCategories,
  };

  return (<AppConsumer>
    {({ currentUser }) => {
      return <Form {...updatedProps} currencies={currentUser?.configs?.dealCurrency || []} />;
    }}
  </AppConsumer>)
  
};

const getRefetchQueries = () => {
  return [
    "accountDetail",
    "accounts",
    "accountsCount",
    "accountCategories",
  ];
};

export default AccountFormContainer;