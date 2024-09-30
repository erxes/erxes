import GenerateCustomFields from "@erxes/ui-forms/src/settings/properties/components/GenerateCustomFields";
import { queries as fieldQueries } from "@erxes/ui-forms/src/settings/properties/graphql";
import { FieldsGroupsQueryResponse } from "@erxes/ui-forms/src/settings/properties/types";
import Spinner from "@erxes/ui/src/components/Spinner";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { gql } from "@apollo/client";
import React from "react";

import { mutations, queries } from "../graphql";
import { ClientPoratlUserDetailQueryResponse } from "../types";
import { useQuery, useMutation } from "@apollo/client";

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
        contentType: "clientportal:user",
        isDefinedByErxes: false
      }
    }
  );

  const clientPortalUserDetailQuery =
    useQuery<ClientPoratlUserDetailQueryResponse>(
      gql(queries.clientPortalUserDetail),
      {
        variables: {
          _id: id
        }
      }
    );

  const [editMutation] = useMutation(gql(mutations.clientPortalUsersEdit));

  if (
    fieldsGroupsQuery &&
    fieldsGroupsQuery.loading &&
    clientPortalUserDetailQuery &&
    clientPortalUserDetailQuery.loading
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
    customFieldsData:
      clientPortalUserDetailQuery.data &&
      clientPortalUserDetailQuery.data.clientPortalUserDetail.customFieldsData,
    fieldsGroups: fieldsGroupsQuery.data
      ? fieldsGroupsQuery.data.fieldsGroups
      : [],
    isDetail,
    object: clientPortalUserDetailQuery
  };

  return <GenerateCustomFields {...updatedProps} />;
};

export default CustomFieldsSection;
