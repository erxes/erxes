import React from 'react';
import { withProps, Alert, Spinner } from 'erxes-ui';
import MatchCategoryForm from '../components/matchForm/MatchCategoryForm';
import { mutations, queries } from '../graphql';
import {
  ICarCategory,
  CarCategoryMatchQueryResponse,
  CarCategoryMatchMutationResponse,
  CarCategoryMatchMutationVariables,
  IRouterProps
} from '../types';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';

type Props = {
  carCategory: ICarCategory;
  closeModal: () => void;
};

type FinalProps = {
  carCategoryMatchQuery: CarCategoryMatchQueryResponse;
} & Props &
  IRouterProps &
  CarCategoryMatchMutationResponse;

class CategoryFormContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  saveMatch = (productIds: string[]) => {
    this.props
      .editMatch({
        variables: { carCategoryId: this.props.carCategory._id, productIds }
      })
      .then(() => {
        Alert.success('You successfully added a products');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  render() {
    const { carCategoryMatchQuery } = this.props;

    if (carCategoryMatchQuery.loading) {
      return <Spinner />;
    }

    const response: any = carCategoryMatchQuery.carCategoryMatchProducts || {};

    const extendedProps = {
      ...this.props,
      products: response.products || [],
      saveMatch: this.saveMatch
    };

    return <MatchCategoryForm {...extendedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, CarCategoryMatchQueryResponse, {}>(
      gql(queries.carCategoryMatchProducts),
      {
        name: 'carCategoryMatchQuery',
        options: ({ carCategory }) => ({
          variables: { carCategoryId: carCategory._id },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<
      {},
      CarCategoryMatchMutationResponse,
      CarCategoryMatchMutationVariables
    >(gql(mutations.carCategoryMatch), {
      name: 'editMatch',
      options: {
        refetchQueries: ['carCategoryMatchProducts']
      }
    })
  )(withRouter<IRouterProps>(CategoryFormContainer))
);
