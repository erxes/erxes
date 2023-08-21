import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { router as routerUtils, withProps } from 'modules/common/utils';
import queryString from 'query-string';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { withRouter } from 'react-router-dom';
import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types';
import DumbBrands from '../components/Brands';
import { mutations, queries } from '../graphql';
import {
  BrandDetailQueryResponse,
  BrandsCountQueryResponse,
  BrandsGetLastQueryResponse
} from '@erxes/ui/src/brands/types';
import Spinner from 'modules/common/components/Spinner';
import ButtonMutate from 'modules/common/components/ButtonMutate';

type Props = {
  currentBrandId: string;
};

type FinalProps = {
  brandDetailQuery: BrandDetailQueryResponse;
  brandsCountQuery: BrandsCountQueryResponse;
} & Props &
  IRouterProps;

class Brands extends React.Component<FinalProps> {
  render() {
    const {
      brandDetailQuery,
      brandsCountQuery,
      location,
      currentBrandId
    } = this.props;

    if (brandDetailQuery.loading || brandsCountQuery.loading) {
      return <Spinner objective={true} />;
    }

    const queryParams = queryString.parse(location.search);

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      object
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
            object ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };

    const extendedProps = {
      ...this.props,
      renderButton,
      queryParams: queryString.parse(location.search),
      currentBrand: brandDetailQuery.brandDetail || {},
      brandsTotalCount: brandsCountQuery.brandsTotalCount || 0,
      loading: brandDetailQuery.loading
    };

    return <DumbBrands {...extendedProps} />;
  }
}

const getRefetchQueries = (queryParams, currentBrandId?: string) => {
  return [
    {
      query: gql(queries.brands),
      variables: {
        perPage: queryParams.limit ? parseInt(queryParams.limit, 10) : 20
      }
    },
    {
      query: gql(queries.brands)
    },
    {
      query: gql(queries.integrationsCount)
    },
    {
      query: gql(queries.brandDetail),
      variables: { _id: currentBrandId || '' }
    },
    { query: gql(queries.brandsCount) },
    { query: gql(queries.brands) }
  ];
};

const BrandsContainer = withProps<Props>(
  compose(
    graphql<Props, BrandDetailQueryResponse, { _id: string }>(
      gql(queries.brandDetail),
      {
        name: 'brandDetailQuery',
        options: ({ currentBrandId }: { currentBrandId: string }) => ({
          variables: { _id: currentBrandId },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, BrandsCountQueryResponse, {}>(gql(queries.brandsCount), {
      name: 'brandsCountQuery'
    })
  )(Brands)
);

type WithCurrentIdProps = {
  history: any;
  queryParams: any;
};

type WithCurrentIdFinalProps = {
  lastBrandQuery: BrandsGetLastQueryResponse;
} & WithCurrentIdProps;

// tslint:disable-next-line:max-classes-per-file
class WithCurrentId extends React.Component<WithCurrentIdFinalProps> {
  componentWillReceiveProps(nextProps: WithCurrentIdFinalProps) {
    const {
      lastBrandQuery,
      history,
      queryParams: { _id }
    } = nextProps;

    if (
      !history.location.hash &&
      lastBrandQuery &&
      !_id &&
      lastBrandQuery.brandsGetLast &&
      !lastBrandQuery.loading
    ) {
      routerUtils.setParams(
        history,
        { _id: lastBrandQuery.brandsGetLast._id },
        true
      );
    }
  }

  render() {
    const {
      queryParams: { _id }
    } = this.props;

    const updatedProps = {
      ...this.props,
      currentBrandId: _id
    };

    return <BrandsContainer {...updatedProps} />;
  }
}

const WithLastBrand = withProps<WithCurrentIdProps>(
  compose(
    graphql<WithCurrentIdProps, BrandsGetLastQueryResponse, { _id: string }>(
      gql(queries.brandsGetLast),
      {
        name: 'lastBrandQuery',
        skip: ({ queryParams }: { queryParams: any }) => queryParams._id,
        options: ({ queryParams }: { queryParams: any }) => ({
          variables: { _id: queryParams._id },
          fetchPolicy: 'network-only'
        })
      }
    )
  )(WithCurrentId)
);

const WithQueryParams = (props: IRouterProps) => {
  const { location } = props;
  const queryParams = queryString.parse(location.search);

  const extendedProps = { ...props, queryParams };

  return <WithLastBrand {...extendedProps} />;
};

export default withRouter<IRouterProps>(WithQueryParams);
