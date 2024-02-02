import * as compose from 'lodash.flowright';
import Detail from '../components/CoverDetail';
import { gql, useQuery, useMutation } from '@apollo/client';
import React from 'react';
import { Alert } from '@erxes/ui/src/utils';
import { graphql } from '@apollo/client/react/hoc';
import {
  ICover,
  PosCoverEditNoteMutationResponse,
  PosOrderChangePaymentsMutationResponse,
} from '../types';
import { mutations, queries } from '../graphql';
import { CoverDetailQueryResponse } from '../types';
import { IPos, PosDetailQueryResponse } from '../../types';
import { queries as posQueries } from '../../pos/graphql';
import { Spinner, withProps } from '@erxes/ui/src';

type Props = {
  cover: ICover;
};

const CoverDetailContainer = (props: Props) => {
  const { cover } = props;

  const coverDetailQuery = useQuery<CoverDetailQueryResponse>(
    gql(queries.coverDetail),
    {
      variables: {
        _id: cover._id || '',
      },
      fetchPolicy: 'network-only',
    },
  );

  const posDetailQuery = useQuery<PosDetailQueryResponse>(
    gql(posQueries.posDetail),
    {
      variables: {
        _id: props.cover.posToken,
      },
    },
  );

  const [coversEdit] = useMutation<PosOrderChangePaymentsMutationResponse>(
    gql(mutations.coversEdit),
    {
      refetchQueries: ['posOrders', 'posOrdersSummary', 'posCoverDetail'],
    },
  );

  if (coverDetailQuery.loading || posDetailQuery.loading) {
    return <Spinner />;
  }

  const onChangeNote = (coverId, note) => {
    coversEdit({
      variables: {
        _id: coverId,
        note,
      },
    })
      .then(() => {
        Alert.success('You successfully noted.');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const coverDetail = coverDetailQuery?.data?.posCoverDetail || ({} as ICover);
  const pos = posDetailQuery?.data?.posDetail || ({} as IPos);

  const updatedProps = {
    ...props,
    onChangeNote,
    pos,
    cover: coverDetail,
  };

  return <Detail {...updatedProps} />;
};

export default CoverDetailContainer;
