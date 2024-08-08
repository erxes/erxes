import { Alert, confirm } from "@erxes/ui/src/utils";
import { mutations, queries } from "../graphql";
import { useMutation, useQuery } from "@apollo/client";

import ButtonMutate from "@erxes/ui/src/components/ButtonMutate";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import List from "../components/List";
import React from "react";
import Spinner from "@erxes/ui/src/components/Spinner";
import { TagsQueryResponse } from "../types";
import { __ } from "@erxes/ui/src/utils/core";
import { generatePaginationParams } from "@erxes/ui/src/utils/router";
import { gql } from "@apollo/client";
import { NavigateFunction, Location } from 'react-router-dom';

type Props = {
  location: Location;
  navigate: NavigateFunction;
  queryParams?: Record<string, string>;
};

const ListContainer = (props: Props) => {
  const { queryParams } = props;

  const tagsGetTypes = useQuery(gql(queries.tagsGetTypes));
  const tagsQuery = useQuery<TagsQueryResponse>(gql(queries.tags), {
    variables: {
      type: queryParams && queryParams.tagType,
      searchValue: queryParams && queryParams.searchValue,
      ...generatePaginationParams(queryParams || {})
    },
    fetchPolicy: "network-only"
  });
  const tagsQueryCount = useQuery(gql(queries.tagsQueryCount), {
    variables: {
      type: queryParams && queryParams.tagType,
      searchValue: queryParams && queryParams.searchValue
    },
    fetchPolicy: "network-only"
  });

  const [removeMutation] = useMutation(gql(mutations.remove), {
    refetchQueries: getRefetchQueries(queryParams)
  });
  const [mergeMutation] = useMutation(gql(mutations.merge), {
    refetchQueries: getRefetchQueries(queryParams)
  });

  if (tagsGetTypes.loading) {
    return <Spinner />;
  }

  const tagType = (queryParams && queryParams.tagType) || "";
  const types = (tagsGetTypes.data && tagsGetTypes.data.tagsGetTypes) || [];

  if (types.length === 0) {
    return (
      <EmptyState
        image="/images/actions/5.svg"
        text={__("No taggable plugin found")}
        size="full"
      />
    );
  }

  if (!tagsQuery || !tagsQueryCount) {
    return (
      <EmptyState
        image="/images/actions/5.svg"
        text={__("No taggable plugin found")}
        size="full"
      />
    );
  }

  const remove = tag => {
    confirm(
      `This action will untag all ${tag.type}(s) with this tag and remove the tag. Are you sure?`
    )
      .then(() => {
        removeMutation({ variables: { _id: tag._id } })
          .then(() => {
            Alert.success("You successfully deleted a tag");
            tagsQuery.refetch();
          })
          .catch(e => {
            Alert.error(e.message);
          });
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const merge = (sourceId: string, destId: string, callback) => {
    mergeMutation({ variables: { sourceId, destId } })
      .then(() => {
        callback();
        Alert.success("You successfully merged tags");
        tagsQuery.refetch();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const renderButton = ({
    values,
    isSubmitted,
    callback,
    object,
    name
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.edit : mutations.add}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries(queryParams)}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? "updated" : "added"
        } a ${name}`}
      />
    );
  };

  const total =
    (tagsQueryCount.data && tagsQueryCount.data.tagsQueryCount) || 0;

  const updatedProps = {
    ...props,
    types,
    tags: (tagsQuery.data && tagsQuery.data.tags) || [],
    loading: tagsQuery.loading,
    tagType,
    total,
    remove,
    merge,
    renderButton
  };

  return <List {...updatedProps} />;
};

const getRefetchQueries = queryParams => {
  return [
    {
      query: gql(queries.tags),
      variables: {
        type: queryParams.tagType,
        searchValue: queryParams.searchValue,
        ...generatePaginationParams(queryParams)
      }
    },
    {
      query: gql(queries.tagsQueryCount),
      variables: {
        type: queryParams.tagType,
        searchValue: queryParams.searchValue
      }
    }
  ];
};

export default ListContainer;
