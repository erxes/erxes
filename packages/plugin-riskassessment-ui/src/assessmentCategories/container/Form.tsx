import { withProps } from '@erxes/ui/src/utils/core';
import React from 'react';
import Form from '../components/Form';
import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { queries } from '../graphql';
import { IRouterProps } from '@erxes/ui/src/types';
import { RiskAssesmentsCategoriesListQueryResponse } from '../../common/types';

type Props = {};

type FinalProps = {
  categories: RiskAssesmentsCategoriesListQueryResponse;
} & Props &
  IRouterProps;

type State = {
  loading: boolean;
};

class FormContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);
  }

  render() {
    const { categories } = this.props;

    const updatedProps = {
      ...this.props,
      categories: categories.getRiskAssesmentCategory,
    };

    return <Form {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.listAssessmentCategories), {
      name: 'categories',
    })
  )(withRouter<IRouterProps>(FormContainer))
);
