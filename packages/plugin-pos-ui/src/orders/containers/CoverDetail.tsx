import * as compose from 'lodash.flowright';
import Detail from '../components/CoverDetail';
import gql from 'graphql-tag';
import React from 'react';
import { Alert } from '@erxes/ui/src/utils';
import { graphql } from 'react-apollo';
import {
  ICover,
  PosCoverEditNoteMutationResponse,
  PosOrderChangePaymentsMutationResponse
} from '../types';
import { mutations, queries } from '../graphql';
import { CoverDetailQueryResponse } from '../types';
import { PosDetailQueryResponse } from '../../types';
import { queries as posQueries } from '../../pos/graphql';
import { Spinner, withProps } from '@erxes/ui/src';

type Props = {
  cover: ICover;
};

type FinalProps = {
  coverDetailQuery: CoverDetailQueryResponse;
  posDetailQuery: PosDetailQueryResponse;
} & Props &
  PosCoverEditNoteMutationResponse;

class OrdersDetailContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  onChangeNote = (coverId, note) => {
    const { coversEdit } = this.props;

    coversEdit({
      variables: {
        _id: coverId,
        note
      }
    })
      .then(() => {
        Alert.success('You successfully noted.');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  render() {
    const { coverDetailQuery, posDetailQuery } = this.props;

    if (coverDetailQuery.loading || posDetailQuery.loading) {
      return <Spinner />;
    }

    const cover = coverDetailQuery.posCoverDetail;

    const pos = posDetailQuery.posDetail;

    const updatedProps = {
      ...this.props,
      onChangeNote: this.onChangeNote,
      pos,
      cover
    };

    return <Detail {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, CoverDetailQueryResponse, { _id: string }>(
      gql(queries.coverDetail),
      {
        name: 'coverDetailQuery',
        options: ({ cover }) => ({
          variables: {
            _id: cover._id || ''
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, PosDetailQueryResponse, {}>(gql(posQueries.posDetail), {
      name: 'posDetailQuery',
      options: props => ({
        variables: {
          _id: props.cover.posToken
        }
      })
    }),
    graphql<
      Props,
      PosOrderChangePaymentsMutationResponse,
      {
        _id: string;
        cashAmount: number;
        mobileAmount: number;
        paidAmounts: any;
      }
    >(gql(mutations.coversEdit), {
      name: 'coversEdit',
      options: () => ({
        refetchQueries: ['posOrders', 'posOrdersSummary', 'posCoverDetail']
      })
    })
  )(OrdersDetailContainer)
);
