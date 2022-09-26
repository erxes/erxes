import { IJob } from 'flow/types';
import React from 'react';
import { ActionForms } from '.';

type Props = {
  activeFlowJob: IJob;
  flowJobs: IJob[];
  addFlowJob: (job: IJob, jobId?: string, config?: any) => void;
  closeModal: () => void;
  setUsedPopup: (check: boolean) => void;
};

class JobDetailForm extends React.Component<Props> {
  onSave = () => {
    const { addFlowJob, activeFlowJob, closeModal } = this.props;

    addFlowJob(activeFlowJob);

    closeModal();
  };

  render() {
    const { activeFlowJob } = this.props;

    const { type } = activeFlowJob;

    const Content = ActionForms[type] || ActionForms.default;

    return <Content onSave={this.onSave} {...this.props} type={type} />;
  }
}

export default JobDetailForm;
