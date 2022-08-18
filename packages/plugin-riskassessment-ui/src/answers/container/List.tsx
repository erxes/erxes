import React from 'react';
import { DefaultWrapper } from '../../common/utils';
import AnswersComponent from '../components/List';
import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import { queries as CategoriesQuery } from '../../assessmentCategories/graphql';
import { RiskAssesmentsCategoriesQueryResponse } from '../../common/types';

type Props = {
  categories: RiskAssesmentsCategoriesQueryResponse;
} & IRouterProps;

class Answers extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const { categories } = this.props;

    const contentProps = {
      categories: categories.getRiskAssesmentCategories,
      loading: categories.loading,
    };

    const defaultWrapperProps = {
      title: 'Assessment Category',
      content: <AnswersComponent {...contentProps} />,
      loading: categories.loading,
      isPaginationHide: true,
    };

    return <DefaultWrapper {...defaultWrapperProps} />;
  }
}
export default withProps<Props>(
  compose(
    graphql<Props>(gql(CategoriesQuery.listAssessmentCategories), {
      name: 'categories',
    })
  )(withRouter<IRouterProps>(Answers))
);
