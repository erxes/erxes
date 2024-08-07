import * as compose from "lodash.flowright";

import {
  Alert,
  confirm,
  renderWithProps,
  router as routerUtils
} from "@erxes/ui/src/utils";
import { IItemParams, IOptions, RemoveMutation, SaveMutation } from "../types";
import { mutations, queries } from "../graphql";

import ArchivedItems from "../components/ArchivedItems";
import React from "react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { useLocation, useNavigate } from "react-router-dom";

type IProps = {
  options: IOptions;
  type: string;
  search: string;
  pipelineId: string;
  itemFilters: {
    userIds: string[];
    priorities: string[];
    assignedUserIds: string[];
    labelIds: string[];
    productIds: string[];
    companyIds: string[];
    customerIds: string[];
    startDate: string;
    endDate: string;
    sources: string[];
    hackStages: string[];
  };
};

type IFinalProps = {
  archivedStagesQuery: any;
  archivedItemsQuery: any;
  archivedStagesCountQuery: any;
  archivedItemsCountQuery: any;

  setActiveItemMutation: SaveMutation;
  setActiveStageMutation: any;

  removeMutation: any;
  removeStageMutation: any;
} & IProps;

const ArchivedItemsContainer = (props: IFinalProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const sendToBoard = (item: any) => {
    if (props.type === "item") {
      const { setActiveItemMutation, archivedItemsQuery } = props;

      setActiveItemMutation({
        variables: { _id: item._id, stageId: item.stageId, status: "active" }
      })
        .then(async () => {
          Alert.success("You successfully sent to a board");

          await archivedItemsQuery.refetch();
          routerUtils.setParams(navigate, location, { key: Math.random() });
        })
        .catch(error => {
          Alert.error(error.message);
        });
    } else {
      const { setActiveStageMutation, archivedStagesQuery, options } = props;

      setActiveStageMutation({
        variables: { _id: item._id, type: options.type, status: "active" }
      })
        .then(async () => {
          Alert.success("You successfully sent to a board");

          await archivedStagesQuery.refetch();

          routerUtils.setParams(navigate, location, { key: Math.random() });
        })
        .catch(error => {
          Alert.error(error.message);
        });
    }
  };

  const remove = (item: any) => {
    if (props.type === "item") {
      const { removeMutation, archivedItemsQuery, options } = props;

      confirm().then(() =>
        removeMutation({
          variables: { _id: item._id }
        })
          .then(() => {
            Alert.success(`You successfully deleted a ${options.type}`);

            archivedItemsQuery.refetch();
          })
          .catch(error => {
            Alert.error(error.message);
          })
      );
    } else {
      const { removeStageMutation, archivedStagesQuery } = props;

      confirm().then(() =>
        removeStageMutation({
          variables: { _id: item._id }
        })
          .then(() => {
            Alert.success("You successfully deleted a stage");

            archivedStagesQuery.refetch();
          })
          .catch(error => {
            Alert.error(error.message);
          })
      );
    }
  };

  const loadMore = () => {
    const {
      search,
      pipelineId,
      archivedStagesCountQuery,
      options,
      archivedItemsCountQuery,
      archivedItemsQuery,
      archivedStagesQuery,
      itemFilters,
      type
    } = props;

    let query;
    let loading;
    let hasMore;
    let itemName;
    let items;

    if (archivedItemsQuery) {
      query = archivedItemsQuery;
      loading = archivedItemsQuery.loading || archivedItemsCountQuery.loading;
      itemName = options.queriesName.archivedItemsQuery;
      items = archivedItemsQuery[options.queriesName.archivedItemsQuery] || [];

      hasMore =
        archivedItemsCountQuery[options.queriesName.archivedItemsCountQuery] >
        items.length;
    } else {
      query = archivedStagesQuery;
      loading = archivedStagesQuery.loading || archivedStagesCountQuery.loading;
      itemName = "archivedStages";
      items = archivedStagesQuery.archivedStages || [];
      hasMore = archivedStagesCountQuery.archivedStagesCount > items.length;
    }

    if (!loading && hasMore) {
      let variables = {
        pipelineId,
        search,
        perPage: 20,
        page: items.length
      };

      if (type === "item") {
        variables = {
          ...variables,
          ...itemFilters
        };
      }

      query.fetchMore({
        variables,
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return prev;
          }

          const prevItems = prev[itemName] || [];
          const prevItemIds = prevItems.map(m => m._id);

          const fetchedItems = [] as any;

          for (const item of fetchMoreResult[itemName]) {
            if (!prevItemIds.includes(item._id)) {
              fetchedItems.push(item);
            }
          }

          return {
            ...prev,
            [itemName]: [...prevItems, ...fetchedItems]
          };
        }
      });
    }
  };

  const {
    archivedItemsQuery,
    archivedStagesQuery,
    archivedItemsCountQuery,
    archivedStagesCountQuery,
    options,
    type
  } = props;

  let items;
  let hasMore;

  if (archivedItemsQuery) {
    items = archivedItemsQuery[options.queriesName.archivedItemsQuery] || [];
    hasMore =
      archivedItemsCountQuery[options.queriesName.archivedItemsCountQuery] >
      items.length;
  } else {
    items = archivedStagesQuery.purchasesArchivedStages || [];
    hasMore =
      archivedStagesCountQuery.purchasesArchivedStagesCount > items.length;
  }

  const updatedProps = {
    items,
    sendToBoard: sendToBoard,
    remove: remove,
    type,
    options,
    hasMore,
    loadMore: loadMore
  };

  return <ArchivedItems {...updatedProps} />;
};

export default (props: IProps) => {
  const { options, itemFilters } = props;

  return renderWithProps<IProps>(
    props,
    compose(
      graphql<IProps>(gql(queries.archivedStages), {
        name: "archivedStagesQuery",
        skip: ({ type }) => type === "item",
        options: ({ pipelineId, search }) => ({
          variables: { pipelineId, search },
          fetchPolicy: "network-only"
        })
      }),
      graphql<IProps>(gql(options.queries.archivedItemsQuery), {
        name: "archivedItemsQuery",
        skip: ({ type }) => type === "list",
        options: ({ pipelineId, search }) => ({
          variables: { pipelineId, search, perPage: 20, ...itemFilters },
          fetchPolicy: "network-only"
        })
      }),
      graphql<IProps>(gql(queries.archivedStagesCount), {
        name: "archivedStagesCountQuery",
        skip: ({ type }) => type === "item",
        options: ({ pipelineId, search }) => ({
          variables: { pipelineId, search },
          fetchPolicy: "network-only"
        })
      }),
      graphql<IProps>(gql(options.queries.archivedItemsCountQuery), {
        name: "archivedItemsCountQuery",
        skip: ({ type }) => type === "list",
        options: ({ pipelineId, search }) => ({
          variables: { pipelineId, search, ...itemFilters },
          fetchPolicy: "network-only"
        })
      }),
      graphql<IProps, SaveMutation, IItemParams>(
        gql(options.mutations.editMutation),
        {
          name: "setActiveItemMutation",
          skip: ({ type }) => type === "list",
          options: () => ({
            refetchQueries: ["archivedItemsQuery"]
          })
        }
      ),
      graphql<IProps, SaveMutation, IItemParams>(gql(mutations.stagesEdit), {
        name: "setActiveStageMutation",
        skip: ({ type }) => type === "item"
      }),
      graphql<IProps, RemoveMutation, { _id: string }>(
        gql(options.mutations.removeMutation),
        {
          name: "removeMutation"
        }
      ),
      graphql<IProps>(gql(mutations.stagesRemove), {
        name: "removeStageMutation"
      })
    )(ArchivedItemsContainer)
  );
};
