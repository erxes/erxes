import { gql, useQuery } from "@apollo/client";
import { Spinner } from "@erxes/ui/src";
import ButtonMutate from "@erxes/ui/src/components/ButtonMutate";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import React from "react";
import Form from "../components/CtaxRowForm";
import { mutations, queries } from "../graphql";
import { CtaxRowDetailQueryResponse } from "../types";

type Props = {
  ctaxRowId?: string;
  queryParams: any;
  closeModal: () => void;
};

const CtaxRowFormContainer = (props: Props) => {
  const { ctaxRowId } = props;

  const ctaxRowDetailQuery = useQuery<CtaxRowDetailQueryResponse>(
    gql(queries.ctaxRowDetail),
    {
      skip: !ctaxRowId,
      fetchPolicy: "network-only",
      variables: {
        _id: ctaxRowId || "",
        ctaxRowId: ctaxRowId || "",
      },
    }
  );

  if (ctaxRowDetailQuery && ctaxRowDetailQuery.loading) {
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
        mutation={object ? mutations.ctaxRowsEdit : mutations.ctaxRowsAdd}
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

  const ctaxRow = ctaxRowDetailQuery?.data?.ctaxRowDetail;

  const updatedProps = {
    ...props,
    ctaxRow,
    renderButton,
  };

  return (
    <Form {...updatedProps} />
  )

};

const getRefetchQueries = () => {
  return [
    "ctaxRowDetail",
    "ctaxRows",
    "ctaxRowsCount",
    "ctaxRowCategories",
  ];
};

export default CtaxRowFormContainer;