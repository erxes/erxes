import * as compose from 'lodash.flowright';

import React, { useState } from 'react';

import { DetailQueryResponse } from '@erxes/ui-products/src/types';
import { FLOWJOB_TYPES } from '../../../../constants';
import { IJob } from '../../../../types';
import { IUser } from '@erxes/ui/src/auth/types';
import SingleIncome from '../../../../components/forms/jobs/subForms/SingleIncome';
import SingleMove from '../../../../components/forms/jobs/subForms/SingleMove';
import SingleOutlet from '../../../../components/forms/jobs/subForms/SingleOutlet';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import queries from '@erxes/ui-products/src/graphql/queries';
import { withProps } from '@erxes/ui/src/utils';

type Props = {
  id: string;
  queryParams: any;
  activeFlowJob: IJob;
  flowJobs: IJob[];
  type: string;
  addFlowJob: (job: IJob, id?: string, config?: any) => void;
  closeModal: () => void;
  setUsedPopup: (check: boolean) => void;
};

type FinalProps = {
  productDetailQuery: DetailQueryResponse;
  currentUser: IUser;
} & Props;

const EndPointFormContainer = (props: FinalProps) => {
  const { type, currentUser, productDetailQuery } = props;

  const [saveLoading] = useState(false);

  if (productDetailQuery.loading) {
    return <Spinner />;
  }

  const product = productDetailQuery.productDetail;

  const updatedProps = {
    ...props,
    currentUser,
    saveLoading,
    product,
  };

  if (type === FLOWJOB_TYPES.MOVE) {
    return <SingleMove {...updatedProps} />;
  }

  if (type === FLOWJOB_TYPES.OUTLET) {
    return <SingleOutlet {...updatedProps} />;
  }

  return <SingleIncome {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, DetailQueryResponse>(gql(queries.productDetail), {
      name: 'productDetailQuery',
      options: ({ activeFlowJob }) => ({
        variables: {
          _id: activeFlowJob.config.productId,
        },
      }),
    }),
  )(EndPointFormContainer),
);
