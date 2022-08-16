import React from 'react';
import AssessmentCategoriesComponent from '../components/List';
import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { mutations, queries } from '../graphql';
import { IRouterProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import { RiskAssesmentsCategoriesQueryResponse } from '../../common/types';
import { Alert, confirm, Spinner } from '@erxes/ui/src';

type Props = {
  categories?: RiskAssesmentsCategoriesQueryResponse;
  removeCategory?: any;
} & IRouterProps;

class AssessmentCategories extends React.Component<Props> {
  constructor(props) {
    super(props);

    this.removeCategory = this.removeCategory.bind(this);
  }

  removeCategory(id: string) {
    confirm().then(() => {
      this.props
        .removeCategory({ variables: { id } })
        .then(() => {
          Alert.success('Successfully removed category');
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    });
  }

  render() {
    const { categories } = this.props;

    const updatedProps = {
      ...this.props,
      categories: categories?.getRiskAssesmentCategories,
      loading: categories?.loading,
      totalCount: categories?.getRiskAssesmentCategories?.length,
      removeCategory: this.removeCategory,
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
