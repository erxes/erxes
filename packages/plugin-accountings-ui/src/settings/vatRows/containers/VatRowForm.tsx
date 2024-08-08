import { gql, useQuery } from "@apollo/client";
import { Spinner } from "@erxes/ui/src";
import ButtonMutate from "@erxes/ui/src/components/ButtonMutate";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import React from "react";
import Form from "../components/VatRowForm";
import { mutations, queries } from "../graphql";
import { VatRowDetailQueryResponse } from "../types";

type Props = {
  vatRowId?: string;
  queryParams: any;
  closeModal: () => void;
};

const VatRowFormContainer = (props: Props) => {
  const { vatRowId } = props;

  const vatRowDetailQuery = useQuery<VatRowDetailQueryResponse>(
    gql(queries.vatRowDetail),
    {
      skip: !vatRowId,
      fetchPolicy: "network-only",
      variables: {
        _id: vatRowId || "",
        vatRowId: vatRowId || "",
      },
    }
  );

  if (vatRowDetailQuery && vatRowDetailQuery.loading) {
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
        mutation={object ? mutations.vatRowsEdit : mutations.vatRowsAdd}
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

  const vatRow = vatRowDetailQuery?.data?.vatRowDetail;

  const updatedProps = {
    ...props,
    vatRow,
    renderButton,
  };

  return <Form {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    "vatRowDetail",
    "vatRows",
    "vatRowsCount",
    "vatRowCategories",
  ];
};

export default VatRowFormContainer;