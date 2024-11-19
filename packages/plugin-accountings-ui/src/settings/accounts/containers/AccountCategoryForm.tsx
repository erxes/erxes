
import { gql, useQuery } from "@apollo/client";
import { Spinner } from "@erxes/ui/src";
import ButtonMutate from "@erxes/ui/src/components/ButtonMutate";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import React from "react";
import Form from "../components/AccountCategoryForm";
import { mutations, queries } from "../graphql";
import { AccountCategoriesQueryResponse, AccountCategoryDetailQueryResponse } from "../types";

type Props = {
  accountCategoryId?: string;
  queryParams: any;
  closeModal: () => void;
};

const AccountCategoryFormContainer = (props: Props) => {
  const { accountCategoryId } = props;

  const accountCategoryDetailQuery = useQuery<AccountCategoryDetailQueryResponse>(
    gql(queries.accountCategoryDetail),
    {
      skip: !accountCategoryId,
      fetchPolicy: "network-only",
      variables: {
        _id: accountCategoryId || "",
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
    (accountCategoryDetailQuery && accountCategoryDetailQuery.loading) ||
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
        mutation={object ? mutations.accountCategoriesEdit : mutations.accountCategoriesAdd}
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

  const accountCategory = accountCategoryDetailQuery?.data?.accountCategoryDetail
  const accountCategories = (accountCategoriesQuery?.data?.accountCategories) || [];

  const updatedProps = {
    ...props,
    accountCategory,
    renderButton,
    accountCategories,
  };

  return <Form {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    "accounts",
    "accountsCount",
    "accountCategories",
  ];
};

export default AccountCategoryFormContainer;