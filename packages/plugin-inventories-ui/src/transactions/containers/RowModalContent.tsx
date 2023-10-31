import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
// local
import { queries } from '../graphql';
import RowModalContentComponent from '../components/RowModalContent';

type Props = {
  data: any;
};

const RowModalContentContainer = (props: Props) => {
  const { data } = props;

  // Hooks
  const transactionDetail = useQuery(gql(queries.transactionDetail), {
    variables: { id: data._id },
    fetchPolicy: 'network-only'
  });

  const transactionDetailData = transactionDetail.data
    ? transactionDetail.data.transactionDetail
    : [];

  return (
    <RowModalContentComponent
      loading={transactionDetail.loading}
      data={transactionDetailData}
    />
  );
};

export default compose()(RowModalContentContainer);
