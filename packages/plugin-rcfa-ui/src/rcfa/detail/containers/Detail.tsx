import React from 'react';
import { __, withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';
import { queries } from '../../graphql';
import { jsPlumb } from 'jsplumb';
import jquery from 'jquery';
import { EmptyState, Spinner } from '@erxes/ui/src';
import DetailComponent from '../components/Detail';

type Props = {
  _id: string;
  history: any;
  queryParams: any;
};

type FinalProps = {
  rcfaDetailQueryResponse: any;
} & Props;

class RcfaDetail extends React.Component<FinalProps> {
  constructor(props: any) {
    super(props);
  }

  render() {
    const { rcfaDetailQueryResponse } = this.props;

    const { loading, error, rcfaDetail } = rcfaDetailQueryResponse;

    if (loading) {
      return <Spinner />;
    }

    if (error) {
      return (
        <EmptyState text="RCFA not found" image="/images/actions/24.svg" />
      );
    }

    const updatedProps = {
      detail: rcfaDetail
    };

    return <DetailComponent {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.rcfaDetail), {
      name: 'rcfaDetailQueryResponse',
      skip: ({ _id }) => !_id,
      options: ({ _id }) => ({
        variables: {
          _id
        }
      })
    })
  )(RcfaDetail)
);
