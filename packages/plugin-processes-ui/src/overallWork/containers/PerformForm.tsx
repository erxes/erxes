import * as compose from 'lodash.flowright';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import Form from '../components/PerformForm';
import gql from 'graphql-tag';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { graphql } from 'react-apollo';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import {
  IOverallWorkDet,
  IPerform,
  PerformDetailQueryResponse
} from '../types';
import { mutations, queries } from '../graphql';
import { withProps } from '@erxes/ui/src/utils';
import { UomsQueryResponse } from '@erxes/ui-products/src/types';
import productsQueries from '@erxes/ui-products/src/graphql/queries';

type Props = {
  closeModal: () => void;
  history: any;
  overallWorkDetail?: IOverallWorkDet;
  perform?: IPerform;
  max: number;
};

type FinalProps = {
  performDetailQuery: PerformDetailQueryResponse;
  uomsQuery: UomsQueryResponse;
} & Props;

class PerformFormContainer extends React.Component<FinalProps> {
  render() {
    const {
      overallWorkDetail,
      max,
      performDetailQuery,
      uomsQuery
    } = this.props;

    if (
      (performDetailQuery && performDetailQuery.loading) ||
      uomsQuery.loading
    ) {
      return <Spinner />;
    }

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      disabled
    }: IButtonMutateProps & { disabled?: boolean }) => {
      return (
        <ButtonMutate
          mutation={values._id ? mutations.performEdit : mutations.performAdd}
          variables={values}
          callback={callback}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          uppercase={false}
          successMessage={`You successfully added a ${name}`}
          disabled={disabled}
        />
      );
    };

    const perform = performDetailQuery && performDetailQuery.performDetail;
    const allUoms = uomsQuery.uoms || [];

    const updatedProps = {
      ...this.props,
      allUoms,
      perform,
      renderButton
    };

    return (
      <Form {...updatedProps} overallWorkDetail={overallWorkDetail} max={max} />
    );
  }
}

const getRefetchQueries = () => {
  return ['performs', 'overallWorkDetail', 'performsCount'];
};

export default withProps<Props>(
  compose(
    graphql<Props, PerformDetailQueryResponse, {}>(gql(queries.performDetail), {
      name: 'performDetailQuery',
      options: ({ perform }) => ({
        variables: { _id: perform?._id },
        fetchPolicy: 'network-only'
      }),
      skip: props => !props.perform || !props.perform._id
    }),
    graphql<Props, UomsQueryResponse>(gql(productsQueries.uoms), {
      name: 'uomsQuery'
    })
  )(PerformFormContainer)
);
