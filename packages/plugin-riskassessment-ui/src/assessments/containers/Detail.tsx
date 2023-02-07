import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils/core';
import DetailComponent from '../components/Detail';
import { queries } from '../graphql';
import { Spinner } from '@erxes/ui/src';

type Props = {
  riskAssessment: any;
};

type FinalProps = {
  detailQueryResponse: any;
} & Props;

class Detail extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { riskAssessment, detailQueryResponse } = this.props;

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
      options: ({ riskAssessment }) => ({
        variables: {
          id: riskAssessment._id
        }
      })
    })
  )(Detail)
);
