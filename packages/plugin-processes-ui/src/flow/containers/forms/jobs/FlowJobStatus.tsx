import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import JobStatus from '../../../components/forms/jobs/JobStatus';
import React, { useState } from 'react';
import { graphql } from 'react-apollo';
import { IJob } from '../../../types';
import { IRouterProps } from '@erxes/ui/src/types';
import { IUser } from '@erxes/ui/src/auth/types';
import { JobRefersQueryResponse } from '../../../../job/types';
import { queries } from '../../../../job/graphql';
import { withProps } from '@erxes/ui/src/utils';
import { withRouter } from 'react-router-dom';
import Spinner from '@erxes/ui/src/components/Spinner';
import { ProductsQueryResponse } from '@erxes/ui-products/src/types';
import { queries as productQueries } from '@erxes/ui-products/src/graphql';

type Props = {
  activeFlowJob: IJob;
  flowJobs: IJob[];
  closeModal: () => void;
  setUsedPopup: (check: boolean) => void;
};

type FinalProps = {
  jobRefersQuery: JobRefersQueryResponse;
  productsQuery: ProductsQueryResponse;
  currentUser: IUser;
} & Props &
  IRouterProps;

const FlowJobStatusContainer = (props: FinalProps) => {
  const { currentUser, jobRefersQuery, productsQuery } = props;

  const [saveLoading] = useState(false);

  if (jobRefersQuery.loading || productsQuery.loading) {
    return <Spinner />;
  }

  const jobRefers = jobRefersQuery.jobRefers || [];
  const products = productsQuery.products || [];

  const updatedProps = {
    ...props,
    currentUser,
    saveLoading,
    jobRefers,
    products
  };

  return <JobStatus {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, JobRefersQueryResponse>(gql(queries.jobRefers), {
      name: 'jobRefersQuery',
      options: ({ flowJobs }) => ({
        variables: {
          ids: (flowJobs || [])
            .filter(j => j.config && j.config.jobReferId)
            .map(j => j.config.jobReferId)
        }
      })
    }),
    graphql<Props, ProductsQueryResponse>(gql(productQueries.products), {
      name: 'productsQuery',
      options: ({ flowJobs }) => ({
        variables: {
          ids: (flowJobs || [])
            .filter(j => j.config && j.config.productId)
            .map(j => j.config.productId)
        }
      })
    })
  )(withRouter<FinalProps>(FlowJobStatusContainer))
);
