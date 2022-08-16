import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';
import React from 'react';
import FormCompnent from '../components/Form';
import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import { queries } from '../graphql';
import { RiskAssesmentsCategoriesQueryResponse, RiskAssessmentDetailQueryResponse } from '../common/types';

type Props = {
  asssessmentId?: string;
  categories: RiskAssesmentsCategoriesQueryResponse;
  assessmentDetail?: RiskAssessmentDetailQueryResponse;
};

type FinalProps = {
  object;
  generateDoc: (values: any) => any;
} & ICommonFormProps &
  IRouterProps &
  Props;

class FormContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { categories, assessmentDetail } = this.props;

    const updatedProps = {
      ...this.props,
      categories: categories.getRiskAssesmentCategories,
      loading: categories.loading,
      assessmentDetail: assessmentDetail?.riskAssessmentDetail,
      detailLoading: assessmentDetail?.loading,
    };

    return <FormCompnent {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.listAssessmentCategories), {
      name: 'categories',
    }),
    graphql<Props>(gql(queries.assessmentDetail), {
      name: 'assessmentDetail',
      skip: ({ asssessmentId }) => !asssessmentId,
      options: ({ asssessmentId }) => ({
        variables: { id: asssessmentId },
      }),
    })
  )(withRouter<IRouterProps>(FormContainer))
);
