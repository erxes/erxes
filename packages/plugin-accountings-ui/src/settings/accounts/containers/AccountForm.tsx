
import { gql, useMutation, useQuery } from "@apollo/client";
import { Alert, Spinner } from "@erxes/ui/src";
import ButtonMutate from "@erxes/ui/src/components/ButtonMutate";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { withProps } from "@erxes/ui/src/utils";
import * as compose from "lodash.flowright";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Form from "../components/AccountForm";
import { mutations, queries } from "../graphql";
import { AccountCategoriesQueryResponse, AccountDetailQueryResponse, AddAccountMutationResponse, EditAccountMutationResponse, IAccount } from "../types";

type Props = {
  accountId?: string;
  queryParams: any;
  closeModal: () => void;
};

const AccountFormContainer = (props: Props) => {
  const { accountId } = props;
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);

  const accountDetailQuery = useQuery<AccountDetailQueryResponse>(
    gql(queries.accountDetail),
    {
      skip: !accountId,
      fetchPolicy: "cache-and-network",
      variables: {
        _id: accountId || "",
        accountId: accountId || "",
      },
    }
  );

  // const [addAccountMutation] = useMutation<AddAccountMutationResponse>(
  //   gql(mutations.accountsAdd)
  // );
  // const [editAccountMutation] = useMutation<EditAccountMutationResponse>(
  //   gql(mutations.accountsEdit)
  // );

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

  // const save = (doc) => {
  //   setLoading(true);

  //   const saveMutation = accountId ? editAccountMutation : addAccountMutation;

  //   saveMutation({
  //     variables: {
  //       _id: accountId,
  //       ...doc,
  //     },
  //   })
  //     .then(() => {
  //       Alert.success("You successfully updated a pos");

  //       navigate({
  //         pathname: `/accountings/accounts`,
  //         search: "?refetchList=true",
  //       });
  //     })

  //     .catch((error) => {
  //       Alert.error(error.message);

  //       setLoading(false);
  //     });
  // };

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

  const accountCategories = (accountCategoriesQuery && accountCategoriesQuery?.data?.accountCategories) || [];

  const updatedProps = {
    ...props,
    renderButton,
    accountCategories,
  };

  return <Form {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    "accountDetail",
    "accounts",
    "accountsTotalCount",
    "accountCategories",
  ];
};

export default AccountFormContainer;