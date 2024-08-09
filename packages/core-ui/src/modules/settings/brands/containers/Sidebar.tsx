import * as compose from "lodash.flowright";

import { Alert, confirm, withProps } from "modules/common/utils";
import { ChildProps, graphql } from "@apollo/client/react/hoc";
import { mutations, queries } from "../graphql";

import { BrandRemoveMutationResponse } from "../types";
import { BrandsQueryResponse } from "@erxes/ui/src/brands/types";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import { MutationVariables } from "@erxes/ui/src/types";
import React from "react";
import Sidebar from "../components/Sidebar";
import { gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";

type Props = {
  queryParams: Record<string, string>;
  currentBrandId?: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

type FinalProps = {
  brandsQuery: BrandsQueryResponse;
} & Props &
  BrandRemoveMutationResponse;

const SidebarContainer = (props: ChildProps<FinalProps>) => {
  const { brandsQuery, removeMutation, renderButton } = props;
  const navigate = useNavigate();

  const brands = brandsQuery.brands || [];

  // remove action
  const remove = (brandId) => {
    confirm("This will permanently delete a brand. Are you absolutely sure?", {
      hasDeleteConfirm: true,
    }).then(() => {
      removeMutation({
        variables: { _id: brandId },
      })
        .then(() => {
          Alert.success("You successfully deleted a brand.");
          navigate("/settings/brands");
        })
        .catch((error) => {
          Alert.error(error.message);
        });
    });
  };

  const updatedProps = {
    ...props,
    renderButton,
    brands,
    remove,
    loading: brandsQuery.loading,
  };

  return <Sidebar {...updatedProps} />;
};

const getRefetchQueries = (queryParams, currentBrandId?: string) => {
  return [
    {
      query: gql(queries.brands),
      variables: {
        perPage: queryParams.limit ? parseInt(queryParams.limit, 10) : 20,
      },
    },
    {
      query: gql(queries.brands),
    },
    {
      query: gql(queries.integrationsCount),
    },
    {
      query: gql(queries.brandDetail),
      variables: { _id: currentBrandId || "" },
    },
    { query: gql(queries.brandsCount) },
    { query: gql(queries.brands) },
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, BrandsQueryResponse, { perPage: number }>(
      gql(queries.brands),
      {
        name: "brandsQuery",
        options: ({ queryParams }: { queryParams: Record<string, string> }) => ({
          variables: {
            perPage: queryParams.limit ? parseInt(queryParams.limit, 10) : 20,
          },
          fetchPolicy: "network-only",
        }),
      }
    ),
    graphql<Props, BrandRemoveMutationResponse, MutationVariables>(
      gql(mutations.brandRemove),
      {
        name: "removeMutation",
        options: ({ queryParams, currentBrandId }: Props) => ({
          refetchQueries: getRefetchQueries(queryParams, currentBrandId),
        }),
      }
    )
  )(SidebarContainer)
);
