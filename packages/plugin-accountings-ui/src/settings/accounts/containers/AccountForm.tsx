
import { gql, useQuery, useMutation } from "@apollo/client";
import React, { useState } from "react";
import * as compose from "lodash.flowright";

import { IAccount } from "../types";
import { mutations, queries } from "../graphql";

import ButtonMutate from "@erxes/ui/src/components/ButtonMutate";
import Form from "../components/AccountForm";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { withProps } from "@erxes/ui/src/utils";
import { useNavigate } from "react-router-dom";

type Props = {
  accountId?: string;
  queryParams: any;
  closeModal: () => void;
};

const AccountFormContainer = (props: Props) => {
  const {accountId} = props;
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);

  const posDetailQuery = useQuery<PosDetailQueryResponse>(
    gql(queries.accountDetail),
    {
      skip: !posId,
      fetchPolicy: "cache-and-network",
      variables: {
        _id: posId || "",
        posId: posId || "",
      },
    }
  );

  
  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object,
  }: IButtonMutateProps) => {
    const { unitPrice, accountCount, minimiumCount } = values;
    const attachmentMoreArray: any[] = [];
    const attachment = values.attachment || undefined;
    const attachmentMore = values.attachmentMore || [];

    attachmentMore.map((attach) => {
      attachmentMoreArray.push({ ...attach, __typename: undefined });
    });

    values.unitPrice = Number(unitPrice);
    values.accountCount = Number(accountCount);
    values.minimiumCount = Number(minimiumCount);
    values.attachment = attachment
      ? { ...attachment, __typename: undefined }
      : null;
    values.attachmentMore = attachmentMoreArray;

    return (
      <ButtonMutate
        mutation={object ? mutations.accountsEdit : mutations.accountsAdd}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        uppercase={false}
        successMessage={`You successfully ${
          object ? "updated" : "added"
        } a ${name}`}
      />
    );
  };

  const accountCategories = accountCategoriesQuery.accountCategories || [];

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

export default withProps<Props>(
  compose(
    graphql<Props, AccountCategoriesQueryResponse>(
      gql(queries.accountCategories),
      {
        name: "accountCategoriesQuery",
      }
    ),
  )(AccountFormContainer)
);
