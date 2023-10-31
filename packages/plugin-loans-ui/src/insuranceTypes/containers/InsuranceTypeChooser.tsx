import { Chooser, withProps } from '@erxes/ui/src';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';

import { mutations, queries } from '../graphql';
import {
  AddMutationResponse,
  InsuranceTypesQueryResponse,
  IInsuranceType,
  IInsuranceTypeDoc
} from '../types';
import InsuranceTypeForm from './InsuranceTypeForm';

type Props = {
  search: (value: string, loadMore?: boolean) => void;
  perPage: number;
  searchValue: string;
};

type FinalProps = {
  insuranceTypesQuery: InsuranceTypesQueryResponse;
} & Props &
  AddMutationResponse;

class InsuranceTypeChooser extends React.Component<
  WrapperProps & FinalProps,
  { newInsuranceType?: IInsuranceType }
> {
  constructor(props) {
    super(props);

    this.state = {
      newInsuranceType: undefined
    };
  }

  resetAssociatedItem = () => {
    return this.setState({ newInsuranceType: undefined });
  };

  render() {
    const { data, insuranceTypesQuery, search } = this.props;

    const renderName = insuranceType => {
      return `${insuranceType.code} - ${insuranceType.name} (${insuranceType.percent})`;
    };

    const getAssociatedInsuranceType = (newInsuranceType: IInsuranceType) => {
      this.setState({ newInsuranceType });
    };

    const updatedProps = {
      ...this.props,
      data: {
        _id: data._id,
        name: renderName(data),
        datas: data.insuranceTypes,
        mainTypeId: data.mainTypeId,
        mainType: data.mainType,
        relType: 'insuranceType'
      },
      search,
      clearState: () => search(''),
      title: 'InsuranceType',
      renderForm: formProps => (
        <InsuranceTypeForm
          {...formProps}
          getAssociatedInsuranceType={getAssociatedInsuranceType}
        />
      ),
      renderName,
      newItem: this.state.newInsuranceType,
      resetAssociatedItem: this.resetAssociatedItem,
      datas: insuranceTypesQuery.insuranceTypes || [],
      refetchQuery: queries.insuranceTypes
    };

    return <Chooser {...updatedProps} />;
  }
}

const WithQuery = withProps<Props>(
  compose(
    graphql<
      Props & WrapperProps,
      InsuranceTypesQueryResponse,
      { searchValue: string; perPage: number }
    >(gql(queries.insuranceTypes), {
      name: 'insuranceTypesQuery',
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
    graphql<{}, AddMutationResponse, IInsuranceTypeDoc>(
      gql(mutations.insuranceTypesAdd),
      {
        name: 'insuranceTypesAdd'
      }
    )
  )(InsuranceTypeChooser)
);

type WrapperProps = {
  data: {
    _id?: string;
    name: string;
    insuranceTypes: IInsuranceType[];
    mainTypeId?: string;
    mainType?: string;
    isRelated?: boolean;
  };
  onSelect: (datas: IInsuranceType[]) => void;
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
