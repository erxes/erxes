import * as compose from "lodash.flowright";

import { EditMutationResponse, IContract } from "../../types";

import { FieldsGroupsQueryResponse } from "@erxes/ui-forms/src/settings/properties/types";
import GenerateCustomFields from "@erxes/ui-forms/src/settings/properties/components/GenerateCustomFields";
import React, { useRef } from "react";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import Spinner from "@erxes/ui/src/components/Spinner";
import { queries as fieldQueries } from "@erxes/ui-forms/src/settings/properties/graphql";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { isEnabled } from "@erxes/ui/src/utils/core";
import mutations from "../graphql/mutations";
import { withProps } from "@erxes/ui/src/utils";
import { IContractType } from "../types";

type Props = {
  contractType: IContractType;
  loading?: boolean;
  isDetail: boolean;
  collapseCallback?: () => void;
};

type FinalProps = {
  fieldsGroupsQuery: FieldsGroupsQueryResponse;
} & Props &
  EditMutationResponse;

const ContractTypesCustomFields = (props: FinalProps) => {
  const ref = useRef(null);
  const {
    contractType,
    contractTypesEdit,
    fieldsGroupsQuery,
    loading,
    isDetail,
    collapseCallback
  } = props;

  if (fieldsGroupsQuery && fieldsGroupsQuery.loading) {
    return (
      <Sidebar full={true}>
        <Spinner />
      </Sidebar>
    );
  }

  const save = (variables, callback) => {
    contractTypesEdit({
      variables: { ...contractType, ...variables }
    })
      .then(() => {
        callback();
      })
      .catch(e => {
        callback(e);
      });
  };

  const updatedProps = {
    save,
    loading,
    customFieldsData: contractType.customFieldsData,
    fieldsGroups: fieldsGroupsQuery ? fieldsGroupsQuery.fieldsGroups : [],
    isDetail,
    object: contractType,
    collapseCallback
  };

  return <GenerateCustomFields ref={ref} {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, FieldsGroupsQueryResponse, { contentType: string }>(
      gql(fieldQueries.fieldsGroups),
      {
        name: "fieldsGroupsQuery",
        options: () => ({
          variables: {
            contentType: "loans:contractType",
            isDefinedByErxes: false
          }
        })
      }
    ),

    // mutations
    graphql<Props, EditMutationResponse, IContract>(
      gql(mutations.contractTypesEdit),
      {
        name: "contractTypesEdit",
        options: () => ({
          refetchQueries: ["contractTypeDetail"]
        })
      }
    )
  )(ContractTypesCustomFields)
);
