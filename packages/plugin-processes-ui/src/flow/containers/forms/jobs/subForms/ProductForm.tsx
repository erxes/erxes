import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import SingleIncome from '../../../../components/forms/jobs/subForms/SingleIncome';
import SingleMove from '../../../../components/forms/jobs/subForms/SingleMove';
import SingleOutlet from '../../../../components/forms/jobs/subForms/SingleOutlet';
import React, { useState } from 'react';
import { graphql } from 'react-apollo';
import { IJob } from '../../../../types';
import { IRouterProps } from '@erxes/ui/src/types';
import { IUser } from '@erxes/ui/src/auth/types';
import { withProps } from '@erxes/ui/src/utils';
import { withRouter } from 'react-router-dom';
import { ProductsQueryResponse } from '@erxes/ui-products/src/types';
import queries from '@erxes/ui-products/src/graphql/queries';
import Spinner from '@erxes/ui/src/components/Spinner';

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
  productsQuery: ProductsQueryResponse;
  currentUser: IUser;
} & Props &
  IRouterProps;

const EndPointFormContainer = (props: FinalProps) => {
  const { type, currentUser, productsQuery } = props;

  const [saveLoading] = useState(false);

  if (productsQuery.loading) {
    return <Spinner />;
  }

  const products = productsQuery.products || [];

  const updatedProps = {
    ...props,
    currentUser,
    saveLoading,
    products
  };

  if (type === 'move') {
    return <SingleMove {...updatedProps} />;
  }

  if (type === 'outlet') {
    return <SingleOutlet {...updatedProps} />;
  }

  return <SingleIncome {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, ProductsQueryResponse>(gql(queries.products), {
      name: 'productsQuery',
      options: ({ activeFlowJob }) => ({
        variables: {
          ids: [activeFlowJob.config.productId]
        }
      })
    })
  )(withRouter<FinalProps>(EndPointFormContainer))
);
