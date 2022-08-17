import { Alert } from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { RiskAssesmentsCategoriesQueryResponse } from '../../common/types';
import Form from '../components/Form';
import { mutations, queries } from '../graphql';

type Props = {
  trigger?: JSX.Element;
  categoryId?: string;
  formId?: string;
};

type FinalProps = {
  categories: RiskAssesmentsCategoriesQueryResponse;
  categoryDetail: any;
  addCategory: any;
} & Props &
  IRouterProps;

type State = {
  loading: boolean;
};

class FormContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.addCategory = this.addCategory.bind(this);
  }

  addCategory(variables) {
    this.props
      .addCategory({ variables })
      .then(() => {
        Alert.success('Category added successfully');
      })
      .catch((e) => Alert.error(e.message));
  }

  render() {
    const { categories, categoryDetail } = this.props;

    const updatedProps = {
      ...this.props,
      categories: categories.getRiskAssesmentCategories,
      detail: categoryDetail?.getRiskAssesmentCategory,
      loading: categoryDetail?.loading,
      addCategory: this.addCategory,
    };

    return <Form {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.listAssessmentCategories), {
      name: 'categories',
    }),
    graphql<Props>(gql(queries.riskAssessmentDetail), {
      name: 'categoryDetail',
      options: ({ categoryId }) => ({
        variables: { id: categoryId },
      }),
      skip: ({ categoryId }) => !categoryId,
    }),
    graphql<Props>(gql(mutations.addAssessmentCategory), {
      name: 'addCategory',
    })
  )(withRouter<IRouterProps>(FormContainer))
);
