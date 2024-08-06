import { IItemParams, SaveMutation } from "@erxes/ui-sales/src/boards/types";
import GenerateCustomFields from "@erxes/ui-forms/src/settings/properties/components/GenerateCustomFields";
import { queries as fieldQueries } from "@erxes/ui-forms/src/settings/properties/graphql";
import { FieldsGroupsQueryResponse } from "@erxes/ui-forms/src/settings/properties/types";
import Spinner from "@erxes/ui/src/components/Spinner";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { gql, useQuery, useMutation } from "@apollo/client";
import React from "react";

import { mutations, queries } from "../../graphql";
import { DetailQueryResponse } from "../../types";

type Props = {
  isDetail: boolean;
  id: string;
};

const CustomFieldsSection = (props: Props) => {
  const { id, isDetail } = props;

  const fieldsGroupsQuery = useQuery<FieldsGroupsQueryResponse>(
    gql(fieldQueries.fieldsGroups),
    {
      variables: {
        contentType: "cars:car",
        isDefinedByErxes: false
      }
    }
  );

  const carDetailQuery = useQuery<DetailQueryResponse>(gql(queries.carDetail), {
    variables: {
      _id: id
    }
  });

  const [editMutation] = useMutation<SaveMutation>(gql(mutations.carsEdit));

  if (
    fieldsGroupsQuery &&
    fieldsGroupsQuery.loading &&
    carDetailQuery &&
    carDetailQuery.loading
  ) {
    return (
      <Sidebar full={true}>
        <Spinner />
      </Sidebar>
    );
  }
  const save = (data, callback) => {
    editMutation({
      variables: { _id: id, ...data }
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
    customFieldsData: carDetailQuery?.data?.carDetail.customFieldsData,
    fieldsGroups: fieldsGroupsQuery
      ? fieldsGroupsQuery?.data?.fieldsGroups
      : [],
    isDetail,
    object: carDetailQuery
  };

  return <GenerateCustomFields {...updatedProps} />;
};

export default CustomFieldsSection;
