import * as compose from 'lodash.flowright';
import { gql } from '@apollo/client';
import SingleIncome from '../../../../components/forms/jobs/subForms/SingleIncome';
import SingleMove from '../../../../components/forms/jobs/subForms/SingleMove';
import SingleOutlet from '../../../../components/forms/jobs/subForms/SingleOutlet';
import React, { useState } from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { IJob } from '../../../../types';
import { IRouterProps } from '@erxes/ui/src/types';
import { IUser } from '@erxes/ui/src/auth/types';
import { withProps } from '@erxes/ui/src/utils';
import { withRouter } from 'react-router-dom';
import { DetailQueryResponse } from '@erxes/ui-products/src/types';
import queries from '@erxes/ui-products/src/graphql/queries';
import Spinner from '@erxes/ui/src/components/Spinner';
import { FLOWJOB_TYPES } from '../../../../constants';

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
} & Props &
  IRouterProps;

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
    product
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
          _id: activeFlowJob.config.productId
        }
      })
    })
  )(withRouter<FinalProps>(EndPointFormContainer))
);
