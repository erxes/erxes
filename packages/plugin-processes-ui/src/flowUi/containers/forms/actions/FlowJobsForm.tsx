import React from 'react';
import { IJob } from '../../../../flow/types';
import Form from '../../../components/forms/actions/FlowJobsForm';

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
