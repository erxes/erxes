import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils/core';
import DetailComponent from '../components/Detail';
import { queries } from '../graphql';

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

    const updatedProps = {
      riskAssessment,
      detail: detailQueryResponse.riskAssessmentDetail
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
