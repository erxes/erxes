import * as compose from 'lodash.flowright';

import { FlowDetailQueryResponse, IFlow } from '../../../../types';
import React, { useState } from 'react';

import { IJob } from '../../../../types';
import { IUser } from '@erxes/ui/src/auth/types';
import Spinner from '@erxes/ui/src/components/Spinner';
import SubFlowForm from '../../../../components/forms/jobs/subForms/SubFlowForm';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../../../../graphql';
import { withProps } from '@erxes/ui/src/utils';

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
  flowDetailQuery: FlowDetailQueryResponse;
  currentUser: IUser;
} & Props;

const SubFlowFormContainer = (props: FinalProps) => {
  const { currentUser, flowDetailQuery, activeFlowJob } = props;

  const [saveLoading] = useState(false);

  if (activeFlowJob.config.subFlowId && flowDetailQuery.loading) {
    return <Spinner />;
  }

  let subFlow: IFlow | undefined = undefined;
  if (activeFlowJob.config.subFlowId) {
    subFlow = flowDetailQuery.flowDetail;
  }

  const updatedProps = {
    ...props,
    currentUser,
    saveLoading,
    subFlow,
  };

  return <SubFlowForm {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, FlowDetailQueryResponse>(gql(queries.flowDetail), {
      name: 'flowDetailQuery',
      skip: ({ activeFlowJob }) => !activeFlowJob.config.subFlowId,
      options: ({ activeFlowJob }) => ({
        variables: {
          _id: activeFlowJob.config.subFlowId,
        },
      }),
    }),
  )(SubFlowFormContainer),
);
