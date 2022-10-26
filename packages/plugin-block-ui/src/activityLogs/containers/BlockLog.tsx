import * as compose from 'lodash.flowright';

import { IActivityLogItemProps } from '@erxes/ui-log/src/activityLogs/types';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import BlockLog from '../component/BlockLog';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries } from '../../graphql';
import { withProps } from '@erxes/ui/src/utils';
import { InvestmentsQueryResponse } from '../../types';

type Props = {
  erxesCustomerId: string;
  packageId: string;
  amount: number;
  activity: IActivityLogItemProps;
};

type FinalProps = {
  investmentsQuery: InvestmentsQueryResponse;
} & Props;

const BlockLogContainer = (props: FinalProps) => {
  const { investmentsQuery } = props;

  if (investmentsQuery.loading) {
    return <Spinner />;
  }

  const investments = investmentsQuery.investments;

  return <BlockLog investments={investments} {...props} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, InvestmentsQueryResponse>(gql(queries.investments), {
      name: 'investmentsQuery'
    })
  )(BlockLogContainer)
);
