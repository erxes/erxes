import * as compose from "lodash.flowright";

import {
  BrandDetailQueryResponse,
  BrandsCountQueryResponse,
  BrandsGetLastQueryResponse,
} from "@erxes/ui/src/brands/types";
import { mutations, queries } from "../graphql";
import { router as routerUtils, withProps } from "modules/common/utils";

import ButtonMutate from "modules/common/components/ButtonMutate";
import DumbBrands from "../components/Brands";
import { IButtonMutateProps } from "@erxes/ui/src/types";
import React from "react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import queryString from "query-string";
import { NavigateFunction, Location } from 'react-router-dom';

type Props = {
  currentBrandId: string;
};

type FinalProps = {
  brandDetailQuery: BrandDetailQueryResponse;
  brandsCountQuery: BrandsCountQueryResponse;
} & Props;

class Brands extends React.Component<FinalProps> {
  render() {
    const { brandDetailQuery, brandsCountQuery, currentBrandId } = this.props;

    const queryParams = queryString.parse(location.search);

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      object,
    }: IButtonMutateProps) => {
      return (
        <ButtonMutate
          mutation={object ? mutations.brandEdit : mutations.brandAdd}
          variables={values}
          callback={callback}
          refetchQueries={getRefetchQueries(queryParams, currentBrandId)}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={`You successfully ${
            object ? "updated" : "added"
          } a ${name}`}
        />
      );
    };

    const extendedProps = {
      ...this.props,
      renderButton,
      queryParams: queryString.parse(location.search),
      currentBrand: brandDetailQuery?.brandDetail || {},
      brandsTotalCount: brandsCountQuery?.brandsTotalCount || 0,
      loading: brandDetailQuery?.loading,
    };

    return <DumbBrands {...extendedProps} />;
  }
}

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

const BrandsContainer = withProps<Props>(
  compose(
    graphql<Props, BrandDetailQueryResponse, { _id: string }>(
      gql(queries.brandDetail),
      {
        name: "brandDetailQuery",
        options: ({ currentBrandId }: { currentBrandId: string }) => ({
          variables: { _id: currentBrandId },
          fetchPolicy: "network-only",
        }),
      }
    ),
    graphql<Props, BrandsCountQueryResponse, {}>(gql(queries.brandsCount), {
      name: "brandsCountQuery",
    })
  )(Brands)
);

type WithCurrentIdProps = {
  location: Location;
  queryParams: Record<string, string>;
  navigate: NavigateFunction;
};

type WithCurrentIdFinalProps = {
  lastBrandQuery: BrandsGetLastQueryResponse;
} & WithCurrentIdProps;

// tslint:disable-next-line:max-classes-per-file
class WithCurrentId extends React.Component<WithCurrentIdFinalProps> {
  componentWillReceiveProps(nextProps: WithCurrentIdFinalProps) {
    const {
      navigate,
      location,
      lastBrandQuery,
      queryParams: { _id },
    } = nextProps;

    if (
      !location.hash &&
      lastBrandQuery &&
      !_id &&
      lastBrandQuery.brandsGetLast &&
      !lastBrandQuery.loading
    ) {
      routerUtils.setParams(
        navigate,
        location,
        { _id: lastBrandQuery.brandsGetLast._id },
        true
      );
    }
  }

  render() {
    const {
      queryParams: { _id },
    } = this.props;

    const updatedProps = {
      ...this.props,
      currentBrandId: _id,
    };

    return <BrandsContainer {...updatedProps} />;
  }
}

const WithLastBrand = withProps<WithCurrentIdProps>(
  compose(
    graphql<WithCurrentIdProps, BrandsGetLastQueryResponse, { _id: string }>(
      gql(queries.brandsGetLast),
      {
        name: "lastBrandQuery",
        skip: ({ queryParams }: { queryParams: Record<string, string> }) => !!queryParams._id,
        options: ({ queryParams }: { queryParams: Record<string, string> }) => ({
          variables: { _id: queryParams._id },
          fetchPolicy: "network-only",
        }),
      }
    )
  )(WithCurrentId)
);

const WithQueryParams = (props: {
  queryParams: Record<string, string>;
  location: Location;
  navigate: NavigateFunction;
}) => {
  const extendedProps = { ...props };

  return <WithLastBrand {...extendedProps} />;
};

export default WithQueryParams;
