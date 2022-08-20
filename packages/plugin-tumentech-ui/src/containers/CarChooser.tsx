import ConformityChooser from '@erxes/ui-cards/src/conformity/containers/ConformityChooser';
import { withProps } from '@erxes/ui/src';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';

import { mutations, queries } from '../graphql';
import {
  AddMutationResponse,
  CarsQueryResponse,
  ICar,
  ICarDoc
} from '../types';
import CarForm from './CarForm';

type Props = {
  search: (value: string, loadMore?: boolean) => void;
  perPage: number;
  searchValue: string;
};

type FinalProps = {
  carsQuery: CarsQueryResponse;
} & Props &
  AddMutationResponse;

class CarChooser extends React.Component<
  WrapperProps & FinalProps,
  { newCar?: ICar }
> {
  constructor(props) {
    super(props);

    this.state = {
      newCar: undefined
    };
  }

  resetAssociatedItem = () => {
    return this.setState({ newCar: undefined });
  };

  render() {
    const { data, carsQuery, search } = this.props;

    const renderName = car => {
      return car.plateNumber || car.vinNumber || 'Unknown';
    };

    const getAssociatedCar = (newCar: ICar) => {
      this.setState({ newCar });
    };

    const updatedProps = {
      ...this.props,
      data: {
        _id: data._id,
        name: renderName(data),
        datas: data.cars,
        mainTypeId: data.mainTypeId,
        mainType: data.mainType,
        relType: 'car'
      },
      search,
      clearState: () => search(''),
      title: 'Car',
      renderForm: formProps => (
        <CarForm {...formProps} getAssociatedCar={getAssociatedCar} />
      ),
      renderName,
      newItem: this.state.newCar,
      resetAssociatedItem: this.resetAssociatedItem,
      datas: carsQuery.cars || [],
      refetchQuery: queries.cars
    };

    return <ConformityChooser {...updatedProps} />;
  }
}

const WithQuery = withProps<Props>(
  compose(
    graphql<
      Props & WrapperProps,
      CarsQueryResponse,
      { searchValue: string; perPage: number }
    >(gql(queries.cars), {
      name: 'carsQuery',
      options: ({ searchValue, perPage, data }) => {
        return {
          variables: {
            searchValue,
            perPage,
            mainType: data.mainType,
            mainTypeId: data.mainTypeId,
            isRelated: data.isRelated,
            sortField: 'createdAt',
            sortDirection: -1
          },
          fetchPolicy: data.isRelated ? 'network-only' : 'cache-first'
        };
      }
    }),
    // mutations
    graphql<{}, AddMutationResponse, ICarDoc>(gql(mutations.carsAdd), {
      name: 'carsAdd'
    })
  )(CarChooser)
);

type WrapperProps = {
  data: {
    _id?: string;
    name: string;
    cars: ICar[];
    mainTypeId?: string;
    mainType?: string;
    isRelated?: boolean;
  };
  onSelect: (datas: ICar[]) => void;
  closeModal: () => void;
};

export default class Wrapper extends React.Component<
  WrapperProps,
  {
    perPage: number;
    searchValue: string;
  }
> {
  constructor(props) {
    super(props);

    this.state = { perPage: 20, searchValue: '' };
  }

  search = (value, loadmore) => {
    let perPage = 20;

    if (loadmore) {
      perPage = this.state.perPage + 20;
    }

    return this.setState({ perPage, searchValue: value });
  };

  render() {
    const { searchValue, perPage } = this.state;

    return (
      <WithQuery
        {...this.props}
        search={this.search}
        searchValue={searchValue}
        perPage={perPage}
      />
    );
  }
}
