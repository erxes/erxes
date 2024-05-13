import { Alert, Bulk, router } from "@erxes/ui/src";
import { MainQueryResponse, RemoveMutationResponse } from "../types";
import { gql, useMutation, useQuery } from "@apollo/client";
import { mutations, queries } from "../graphql";

import CarsList from "../components/list/CarsList";
import React from "react";
import { graphql } from "@apollo/client/react/hoc";
import { useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
};

const CarsListContainer = (props: Props) => {
  const navigate = useNavigate();
  const { queryParams } = props;

  const carsMainQuery = useQuery<MainQueryResponse>(gql(queries.carsMain), {
    variables: {
      ...router.generatePaginationParams(queryParams || {}),
      ids: queryParams.ids,
      categoryId: queryParams.categoryId,
      searchValue: queryParams.searchValue,
      tag: queryParams.tag,
      segment: queryParams.segment,
      segmentData: queryParams.segmentData,
      sortField: queryParams.sortField,
      sortDirection: queryParams.sortDirection
        ? parseInt(queryParams.sortDirection, 10)
        : undefined,
    },
    fetchPolicy: "network-only",
  });

  const [carsRemove] = useMutation<RemoveMutationResponse>(
    gql(mutations.carsRemove),
    generateOptions()
  );
  const [carsMerge] = useMutation(gql(mutations.carsMerge), generateOptions());

  const removeCars = ({ carIds }, emptyBulk) => {
    carsRemove({
      variables: { carIds },
    })
      .then(() => {
        emptyBulk();
        Alert.success("You successfully deleted a car");
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const mergeCars = ({ ids, data, callback }) => {
    carsMerge({
      variables: {
        carIds: ids,
        carFields: data,
      },
    })
      .then((response) => {
        Alert.success("You successfully merged cars");
        callback();
        navigate(`/erxes-plugin-car/details/${response.data.carsMerge._id}`);
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const carsList = (bulkProps) => {
    const searchValue = queryParams.searchValue || "";
    const { list = [], totalCount = 0 } = carsMainQuery?.data?.carsMain || {};

    const updatedProps = {
      ...props,
      totalCount,
      searchValue,
      cars: list,
      loading: carsMainQuery.loading,
      remove: removeCars,
      merge: mergeCars,
    };

    return <CarsList {...updatedProps} {...bulkProps} />;
  };

  const refetch = () => {
    carsMainQuery.refetch();
  };

  return <Bulk content={carsList} refetch={refetch} />;
};

const generateOptions = () => ({
  refetchQueries: [
    "carsMain",
    "carCounts",
    "carCategories",
    "carCategoriesTotalCount",
  ],
});

export default CarsListContainer;
