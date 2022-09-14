import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';
import { Spinner } from '@erxes/ui/src';
import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils/core';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import {
  RiskAssessmentsCategoriesQueryResponse,
  RiskAssessmentDetailQueryResponse
} from '../common/types';
import FormCompnent from '../components/Form';
import { queries } from '../graphql';

type Props = {
  asssessmentId?: string;
  assessmentDetail?: RiskAssessmentDetailQueryResponse;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

type FinalProps = {
  object;
  categories: RiskAssessmentsCategoriesQueryResponse;
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
      categories: categories.riskAssesmentCategories,
      loading: categories.loading,
      assessmentDetail: assessmentDetail?.riskAssessmentDetail,
      detailLoading: assessmentDetail?.loading
    };

    if (assessmentDetail?.loading) {
      return <Spinner />;
    }

    return <FormCompnent {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.listAssessmentCategories), {
      name: 'categories'
    }),
    graphql<Props>(gql(queries.assessmentDetail), {
      name: 'assessmentDetail',
      skip: ({ asssessmentId }) => !asssessmentId,
      options: ({ asssessmentId }) => ({
        variables: { id: asssessmentId }
      })
    })
  )(withRouter<IRouterProps>(FormContainer))
);
