import { EmptyState, Spinner, withCurrentUser, withProps } from "@erxes/ui/src";
import { gql, useQuery } from "@apollo/client";

import CarDetails from "../../components/detail/CarDetails";
import { DetailQueryResponse } from "../../types";
import { FieldsGroupsQueryResponse } from "@erxes/ui-forms/src/settings/properties/types";
import { IUser } from "@erxes/ui/src/auth/types";
import React from "react";
import { queries as fieldQueries } from "@erxes/ui-forms/src/settings/properties/graphql";
import { queries } from "../../graphql";

type Props = {
  id: string;
  currentUser: IUser;
};

const CarDetailsContainer = (props: Props) => {
  const { id, currentUser } = props;

  const carDetailQuery = useQuery<DetailQueryResponse>(gql(queries.carDetail), {
    variables: {
      _id: id,
    },
  });

  const fieldsGroupsQuery = useQuery<FieldsGroupsQueryResponse>(
    gql(fieldQueries.fieldsGroups),
    {
      variables: {
        contentType: "cars:car",
        isDefinedByErxes: false,
      },
    }
  );

  if (carDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (!carDetailQuery?.data?.carDetail) {
    return <EmptyState text="Car not found" image="/images/actions/24.svg" />;
  }

  const carDetail = carDetailQuery?.data?.carDetail;

  const updatedProps = {
    ...props,
    loading: carDetailQuery.loading,
    car: carDetail,
    currentUser,
    fieldsGroups: fieldsGroupsQuery
      ? fieldsGroupsQuery?.data?.fieldsGroups
      : [],
  };

  return <CarDetails {...updatedProps} />;
};

export default withCurrentUser(CarDetailsContainer);
