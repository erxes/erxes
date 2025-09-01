import React from "react";
import { gql, useQuery } from "@apollo/client";
import Spinner from "@erxes/ui/src/components/Spinner";
import PropertiesLog from "../component/PropertiesLog";
import { IUser } from "@erxes/ui/src/auth/types";
import queries from "../../settings/properties/graphql/queries";
import { FieldsGroupsQueryResponse } from "../../settings/properties/types";

type Props = {
  activity: any;
  customFieldsData: Array<{ field: string; value: any }>;
  contentType: string;
  currentUser: IUser;
};

const PropertiesLogContainer: React.FC<Props> = (props) => {
  const { activity, contentType } = props;

  const { data, loading, error } = useQuery<FieldsGroupsQueryResponse>(
    gql(queries.fieldsGroups),
    {
      variables: {
        contentType,
        config: activity?.content?.config,
      },
      fetchPolicy: "network-only",
    }
  );

  if (loading) return <Spinner />;
  if (error) return <div>Error loading fields</div>;

  return <PropertiesLog {...props} fieldsGroups={data?.fieldsGroups || []} />;
};

export default PropertiesLogContainer;
