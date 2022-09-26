import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import JobForm from '../../../../components/forms/jobs/subForms/JobForm';
import React, { useState } from 'react';
import { graphql } from 'react-apollo';
import { IJob } from '../../../../types';
import { IRouterProps } from '@erxes/ui/src/types';
import { IUser } from '@erxes/ui/src/auth/types';
import { JobRefersAllQueryResponse } from '../../../../../job/types';
import { queries } from '../../../../../job/graphql';
import { withProps } from '@erxes/ui/src/utils';
import { withRouter } from 'react-router-dom';

type Props = {
  id: string;
  queryParams: any;
  activeFlowJob: IJob;
  flowJobs: IJob[];
  addFlowJob: (job: IJob, id?: string, config?: any) => void;
  closeModal: () => void;
};

type FinalProps = {
  jobRefersAllQuery: JobRefersAllQueryResponse;
  currentUser: IUser;
} & Props &
  IRouterProps;

const JobFormContainer = (props: FinalProps) => {
  const { currentUser, jobRefersAllQuery } = props;

  const [saveLoading] = useState(false);

  const jobRefers = jobRefersAllQuery.jobRefersAll || [];

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
    graphql<Props, JobRefersAllQueryResponse>(gql(queries.jobRefersAll), {
      name: 'jobRefersAllQuery'
    })
  )(withRouter<FinalProps>(JobFormContainer))
);
