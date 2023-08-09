import React from 'react';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';
import { withProps } from '@erxes/ui/src/utils/core';
import queries from '../graphql/queries';
import { RequestDetailQueryResponse } from '../../common/type';
import { Spinner } from '@erxes/ui/src';

import FormComponent from '../components/Form';

type Props = {
  _id: string;
};

type FinalProps = {
  detailQuery: RequestDetailQueryResponse;
} & Props;

class DetailForm extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { detailQuery } = this.props;

    if (detailQuery.loading) {
      return <Spinner />;
    }

    const updatedProps = {
      detail: detailQuery.grantRequestDetail || null
    };

    return <FormComponent {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.requestDetail), {
      name: 'detailQuery',
      options: ({ _id }) => ({
        variables: { _id }
      }),
      skip: ({ _id }) => !_id
    })
  )(DetailForm)
);
