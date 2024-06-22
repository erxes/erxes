import Spinner from "@erxes/ui/src/components/Spinner";
import { Alert, confirm, router as routerUtils } from "@erxes/ui/src/utils";
import { gql } from "@apollo/client";
import React from "react";

import Component from "../components/List";
import mutations from "../graphql/mutations";
import queries from "../graphql/queries";
import {
  ClientPortalConfigsQueryResponse,
  ClientPortalGetLastQueryResponse,
  ClientPortalTotalQueryResponse,
} from "../types";
import { useQuery, useMutation } from "@apollo/client";
import { useLocation, useNavigate } from "react-router-dom";

type ListProps = {
  _id?: string;
  kind: "client" | "vendor";
  queryParams: any;
};

const List: React.FC<ListProps> = (props: ListProps) => {
  const { queryParams, kind } = props;
  const navigate = useNavigate();

  const configsQuery = useQuery<ClientPortalConfigsQueryResponse>(
    gql(queries.getConfigs),
    {
      variables: {
        page: queryParams.page,
        perPage: queryParams.perPage,
        kind,
      },
    }
  );

  const totalCountQuery = useQuery<ClientPortalTotalQueryResponse>(
    gql(queries.getTotalCount)
  );

  const [removeMutation] = useMutation(gql(mutations.remove), {
    refetchQueries: [
      {
        query: gql(queries.getConfigs),
      },
      "clientPortalGetLast",
      "clientPortalGetConfig",
      "clientPortalConfigsTotalCount",
    ],
  });

  const configs =
    (configsQuery.data && configsQuery.data.clientPortalGetConfigs) || [];

  // remove action
  const remove = (_id) => {
    confirm().then(() => {
      removeMutation({
        variables: { _id },
      })
        .then(() => {
          Alert.success("You successfully deleted a business portal.");

          if (configs.length > 1) {
            navigate(
              `/settings/business-portal/${props.kind}?_id=${configs[0]._id}`
            );
          } else {
            navigate("/settings/business-portal");
          }

          configsQuery.refetch();
        })
        .catch((error) => {
          Alert.error(error.message);
        });
    });
  };

  const totalCount =
    (totalCountQuery.data &&
      totalCountQuery.data.clientPortalConfigsTotalCount) ||
    0;

  const updatedProps = {
    ...props,
    remove,
    totalCount,
    configs,
    loading: configsQuery.loading || false,
  };

  return <Component {...updatedProps} />;
};

const ListContainer = List;

// Getting lastConfig id to currentConfig
const LastConfig = (props: ListProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const configGetLastQuery = useQuery<ClientPortalGetLastQueryResponse>(
    gql(queries.getConfigLast),
    {
      fetchPolicy: "network-only",
      variables: {
        kind: props.kind,
      },
    }
  );

  if (configGetLastQuery.loading) {
    return <Spinner objective={true} />;
  }

  const lastConfig =
    configGetLastQuery.data && configGetLastQuery.data.clientPortalGetLast;

  if (lastConfig) {
    routerUtils.setParams(navigate, location, { _id: lastConfig._id });
  }

  const extendedProps = {
    _id: lastConfig && lastConfig._id,
    ...props,
  };

  return <ListContainer {...extendedProps} />;
};

const LastConfigContainer = LastConfig;

// Main home component
const MainContainer = (props: ListProps) => {
  const location = useLocation();

  const _id = routerUtils.getParam(location, "_id");

  if (_id) {
    const extendedProps = { ...props, _id };

    return <ListContainer {...extendedProps} />;
  }

  return <LastConfigContainer {...props} />;
};

export default MainContainer;
