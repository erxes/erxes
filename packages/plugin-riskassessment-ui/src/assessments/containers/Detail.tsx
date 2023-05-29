import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils/core';
import DetailComponent from '../components/Detail';
import { queries } from '../graphql';
import { Spinner } from '@erxes/ui/src';

type Props = {
  riskAssessment: any;
  queryParams: any;
  history: any;
};

type FinalProps = {
  detailQueryResponse: any;
} & Props;

class Detail extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      riskAssessment,
      detailQueryResponse,
      queryParams,
      history
    } = this.props;

    if (detailQueryResponse.loading) {
      return <Spinner />;
    }

    const {
      assignedUsers,
      groupAssessment,
      indicatorAssessment,
      ...detail
    } = detailQueryResponse?.riskAssessmentDetail;

    const updatedProps = {
      queryParams,
      history,
      riskAssessment,
      detail,
      assignedUsers,
      groupAssessment,
      indicatorAssessment
    };

    return <DetailComponent {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.riskAssessmentDetail), {
      name: 'detailQueryResponse',
      options: ({ riskAssessment, queryParams }) => ({
        variables: {
          id: riskAssessment._id,
          showFlagged: !!queryParams?.showFlagged
        }
      })
    })
  )(Detail)
);
