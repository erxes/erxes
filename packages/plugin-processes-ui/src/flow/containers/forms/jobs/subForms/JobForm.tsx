import * as compose from 'lodash.flowright';
import EndPointForm from '../../../../components/forms/jobs/subForms/EndPointForm';
import { gql } from '@apollo/client';
import JobForm from '../../../../components/forms/jobs/subForms/JobForm';
import React, { useState } from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { graphql } from '@apollo/client/react/hoc';
import { IJob } from '../../../../types';
import { IRouterProps } from '@erxes/ui/src/types';
import { IUser } from '@erxes/ui/src/auth/types';
import {
  JobReferDetailQueryResponse,
  IJobRefer
} from '../../../../../job/types';
import { queries } from '../../../../../job/graphql';
import { withProps } from '@erxes/ui/src/utils';
import { withRouter } from 'react-router-dom';
import { FLOWJOB_TYPES } from '../../../../constants';

type Props = {
  id: string;
  queryParams: any;
  activeFlowJob: IJob;
  currentTab: string;
  flowJobs: IJob[];
  type: string;
  addFlowJob: (job: IJob, id?: string, config?: any) => void;
  closeModal: () => void;
  setUsedPopup: (check: boolean) => void;
  setMainState: (param: any) => void;
};

type FinalProps = {
  jobReferDetailQuery: JobReferDetailQueryResponse;
  currentUser: IUser;
} & Props &
  IRouterProps;

const JobFormContainer = (props: FinalProps) => {
  const { currentUser, jobReferDetailQuery, activeFlowJob } = props;

  const [saveLoading] = useState(false);

  if (activeFlowJob.config.jobReferId && jobReferDetailQuery.loading) {
    return <Spinner />;
  }

  let jobRefer: IJobRefer | undefined = undefined;
  if (activeFlowJob.config.jobReferId) {
    jobRefer = jobReferDetailQuery.jobReferDetail;
  }

  const updatedProps = {
    ...props,
    currentUser,
    saveLoading,
    jobRefer
  };

  if (props.type === FLOWJOB_TYPES.ENDPOINT) {
    return <EndPointForm {...updatedProps} />;
  }

  return <JobForm {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, JobReferDetailQueryResponse>(gql(queries.jobReferDetail), {
      name: 'jobReferDetailQuery',
      skip: ({ activeFlowJob }) => !activeFlowJob.config.jobReferId,
      options: ({ activeFlowJob }) => ({
        variables: {
          id: activeFlowJob.config.jobReferId
        }
      })
    })
  )(withRouter<FinalProps>(JobFormContainer))
);
