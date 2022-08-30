import { Alert } from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { commonRefetchType, RiskAssesmentsCategoriesQueryResponse } from '../../common/types';
import AssessmentCategoriesComponent from '../components/List';
import { mutations, queries } from '../graphql';

type Props = {
  categories?: RiskAssesmentsCategoriesQueryResponse;
  removeCategory?: any;
  queryParams?: any;
  riskAssesmentsRefetch?: (params: commonRefetchType) => void;
} & IRouterProps;

class AssessmentCategories extends React.Component<Props> {
  constructor(props) {
    super(props);

    this.removeCategory = this.removeCategory.bind(this);
  }

  removeCategory(id: string) {
    const { removeCategory, categories } = this.props;

    removeCategory({ variables: { id } })
      .then(() => {
        Alert.success('Successfully removed category');
        categories?.refetch();
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  }

  render() {
    const { categories } = this.props;

    const updatedProps = {
      ...this.props,
      categories: categories?.getRiskAssesmentCategories,
      loading: categories?.loading || false,
      totalCount: categories?.getRiskAssesmentCategories?.length || 0,
      removeCategory: this.removeCategory,
      refetch: categories?.refetch!,
    };

    return <AssessmentCategoriesComponent {...updatedProps} />;
  }
}
export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.listAssessmentCategories), {
      name: 'categories',
    }),
    graphql<Props>(gql(mutations.removeAssessmentCategory), {
      name: 'removeCategory',
      options: () => ({
        refetchQueries: ['categories'],
      }),
    })
  )(withRouter<IRouterProps>(AssessmentCategories))
);
