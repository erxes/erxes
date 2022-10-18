import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import JobForm from '../../../../components/forms/jobs/subForms/JobForm';
import React, { useState } from 'react';
import { graphql } from 'react-apollo';
import { IJob } from '../../../../types';
import { IRouterProps } from '@erxes/ui/src/types';
import { IUser } from '@erxes/ui/src/auth/types';
import { JobRefersQueryResponse } from '../../../../../job/types';
import { queries } from '../../../../../job/graphql';
import { withProps } from '@erxes/ui/src/utils';
import { withRouter } from 'react-router-dom';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  id: string;
  queryParams: any;
  activeFlowJob: IJob;
  flowJobs: IJob[];
  addFlowJob: (job: IJob, id?: string, config?: any) => void;
  closeModal: () => void;
  setUsedPopup: (check: boolean) => void;
};

type FinalProps = {
  jobRefersQuery: JobRefersQueryResponse;
  currentUser: IUser;
} & Props &
  IRouterProps;

const JobFormContainer = (props: FinalProps) => {
  const { currentUser, jobRefersQuery } = props;

  const [saveLoading] = useState(false);

  if (jobRefersQuery.loading) {
    return <Spinner />;
  }

  const jobRefers = jobRefersQuery.jobRefers || [];

  const updatedProps = {
    ...props,
    currentUser,
    saveLoading,
    jobRefers
  };

  return <JobForm {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, JobRefersQueryResponse>(gql(queries.jobRefers), {
      name: 'jobRefersQuery',
      options: ({ activeFlowJob }) => ({
        variables: {
          ids: [activeFlowJob.config.jobReferId]
        }
      })
    })
  )(withRouter<FinalProps>(JobFormContainer))
);
