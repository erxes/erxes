import * as compose from 'lodash.flowright';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import Form from '../components/PerformForm';
import React from 'react';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { mutations, queries } from '../graphql';
import { withProps } from '@erxes/ui/src/utils';
import {
  IOverallWorkDet,
  PerformDetailQueryResponse
} from '../../overallWork/types';
import { IPerform } from '../types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  closeModal: () => void;
  history: any;
  overallWorkDetail: IOverallWorkDet;
  perform?: IPerform;
  max?: number;
};

type FinalProps = {
  performDetailQuery: PerformDetailQueryResponse;
} & Props;

class PerformFormContainer extends React.Component<FinalProps> {
  render() {
    const { overallWorkDetail, max, performDetailQuery } = this.props;

    if (performDetailQuery.loading) {
      return <Spinner />;
    }

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback
    }: IButtonMutateProps) => {
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
        />
      );
    };

    const perform = performDetailQuery.perform;

    const updatedProps = {
      ...this.props,
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
      })
    })
  )(PerformFormContainer)
);
