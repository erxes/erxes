import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import { queries } from '../graphql';
import { QueryResponse } from '@erxes/ui/src/types';
import { EmptyState, Spinner } from '@erxes/ui/src';
import FormComponent from '../components/Form';

type Props = {
  _id?: string;
  closeModal: () => void;
};

type FinalProps = {
  planQueryResponse: { riskAssessmentPlan: any } & QueryResponse;
};

class Form extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { planQueryResponse } = this.props;

    if (planQueryResponse?.loading) {
      return <Spinner />;
    }

    const renderButton = () => {};

    const updatedProps = {
      detail: planQueryResponse?.riskAssessmentPlan
    };

    return <FormComponent {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.plan), {
      name: 'planQueryResponse',
      skip: ({ _id }) => !_id,
      options: ({ _id }) => ({
        variables: { _id }
      })
    })
  )(Form)
);
