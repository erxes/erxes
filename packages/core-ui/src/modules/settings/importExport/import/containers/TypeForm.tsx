import Spinner from "@erxes/ui/src/components/Spinner";
import { gql } from "@apollo/client";
import React from "react";
import { IContentType, } from "../../types";
import TypeForm from "../components/TypeForm";
import { queries } from "../../common/graphql";
import { useQuery } from "@apollo/client";

type Props = {
  onChangeContentType: (value: IContentType) => void;
  contentType: string;
  contentTypes: IContentType[];
  type: string;
};

const FormContainer = (props: Props) => {
  const historyGetTypes = useQuery(gql(queries.historyGetTypes), {
    variables: {
      type: "import",
    },
  });

  if (historyGetTypes.loading) {
    return <Spinner />;
  }

  const typeOptions = historyGetTypes.data ? historyGetTypes.data.historyGetTypes : [];

  return (
    <TypeForm
      onChangeContentType={props.onChangeContentType}
      contentType={props.contentType}
      contentTypes={props.contentTypes}
      type={props.type}
      typeOptions={typeOptions}
    />
  );
};

export default FormContainer;
