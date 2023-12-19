import * as compose from 'lodash.flowright';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import Form from '../components/Form';
import { gql } from '@apollo/client';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { graphql } from '@apollo/client/react/hoc';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import {
  IPerform,
  PerformAbortMutationResponse,
  PerformConfirmMutationResponse,
  PerformDetailQueryResponse
} from '../types';
import { mutations, queries } from '../graphql';
import { Alert, withProps } from '@erxes/ui/src/utils';
import { IOverallWorkDet } from '../../overallWork/types';

type Props = {
  closeModal: () => void;
  history: any;
  overallWorkDetail?: IOverallWorkDet;
  perform?: IPerform;
  max: number;
};

type FinalProps = {
  performDetailQuery: PerformDetailQueryResponse;
} & Props &
  PerformConfirmMutationResponse &
  PerformAbortMutationResponse;

class PerformFormContainer extends React.Component<
  FinalProps,
  { changed: boolean; id?: string; perform?: IPerform }
> {
  constructor(props) {
    super(props);

    const { perform } = this.props;

    this.state = {
      id: perform ? perform._id : '' || '',
      changed: false
    };
  }

  render() {
    const {
      overallWorkDetail,
      max,
      performDetailQuery,
      performConfirm,
      performAbort
    } = this.props;

    if (performDetailQuery && performDetailQuery.loading) {
      return <Spinner />;
    }

    let perform = performDetailQuery && performDetailQuery.performDetail;

    if (this.state.changed && this.state.id && this.state.perform) {
      perform = this.state.perform;
    }

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      disabled
    }: IButtonMutateProps & { disabled?: boolean }) => {
      const callBack = data => {
        perform = values._id ? data.performEdit : data.performAdd;
        this.setState({ id: perform._id, changed: true, perform });

        if (callback) {
          callback(data);
        }
      };

      return (
        <ButtonMutate
          mutation={values._id ? mutations.performEdit : mutations.performAdd}
          variables={values}
          callback={callBack}
          refetchQueries={getRefetchQueries(this.state.id)}
          isSubmitted={isSubmitted}
          type="submit"
          uppercase={false}
          successMessage={`You successfully ${
            values._id ? 'updated' : 'added'
          } a ${name}`}
          disabled={disabled}
        />
      );
    };

    const confirmPerform = (_id: string, endAt: Date) => {
      performConfirm({
        variables: { _id, endAt }
      })
        .then(() => {
          Alert.success('You successfully confirmed a performance');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const abortPerform = (_id: string) => {
      performAbort({
        variables: { _id }
      })
        .then(() => {
          Alert.success('You successfully aborted a performance');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const updatedProps = {
      ...this.props,
      perform,
      renderButton,
      confirmPerform,
      abortPerform
    };

    return (
      <Form {...updatedProps} overallWorkDetail={overallWorkDetail} max={max} />
    );
  }
}

const getRefetchQueries = (id?: string) => {
  const qries = ['performs', 'overallWorkDetail', 'performsCount'];
  if (id) {
    return [
      ...qries,
      {
        query: gql(queries.performDetail),
        variables: { _id: id }
      }
    ];
  }
  return qries;
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
    graphql<Props, PerformConfirmMutationResponse, {}>(
      gql(mutations.performConfirm),
      {
        name: 'performConfirm',
        options: {
          refetchQueries: [
            'performs',
            'overallWorkDetail',
            'performsCount',
            'performDetail'
          ]
        }
      }
    ),
    graphql<Props, PerformAbortMutationResponse, {}>(
      gql(mutations.performAbort),
      {
        name: 'performAbort',
        options: {
          refetchQueries: [
            'performs',
            'overallWorkDetail',
            'performsCount',
            'performDetail'
          ]
        }
      }
    )
  )(PerformFormContainer)
);
