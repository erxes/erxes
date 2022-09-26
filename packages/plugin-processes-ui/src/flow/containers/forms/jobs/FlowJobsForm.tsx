import React from 'react';
import { IJob } from '../../../types';
import Form from '../../../components/forms/jobs/FlowJobsForm';

type Props = {
  onClickFlowJob: (flowJob: IJob) => void;
};

const FlowJobsFormContainer = (props: Props) => {
  const extendedProps = {
    ...props
  };
  return <Form {...extendedProps} />;
};

export default FlowJobsFormContainer;
