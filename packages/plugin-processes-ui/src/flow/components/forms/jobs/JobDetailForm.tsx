import { Description, FlowJobTabs, ScrolledContent } from '../../../styles';
import { IJob } from 'flow/types';
import React from 'react';
import { ActionForms } from '.';
import { Tabs, TabTitle } from '@erxes/ui/src/components/tabs';
import { __ } from '@erxes/ui/src/utils/core';
import JobStatus from '../../../containers/forms/jobs/FlowJobStatus';

type Props = {
  activeFlowJob: IJob;
  flowJobs: IJob[];
  addFlowJob: (job: IJob, jobId?: string, config?: any) => void;
  closeModal: () => void;
  setUsedPopup: (check: boolean) => void;
  setMainState: (param: any) => void;
};

type State = {
  activeFlowJob: IJob;
  currentTab: string;
};

class JobDetailForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentTab: 'content',
      activeFlowJob: props.activeFlowJob
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeFlowJob !== this.props.activeFlowJob) {
      this.setState({ activeFlowJob: nextProps.activeFlowJob });
    }
  }

  tabOnClick = (currentTab: string) => {
    this.setState({ currentTab });
  };

  onSave = () => {
    const { addFlowJob, activeFlowJob, closeModal } = this.props;

    addFlowJob(activeFlowJob);

    closeModal();
  };

  renderContent() {
    const { activeFlowJob, currentTab } = this.state;
    const { type } = activeFlowJob;

    if (currentTab === 'status') {
      return (
        <JobStatus
          {...this.props}
          activeFlowJob={activeFlowJob}
          closeModal={this.props.closeModal}
          flowJobs={this.props.flowJobs}
        />
      );
    }

    const Content = ActionForms[type];

    return (
      <Content
        {...this.props}
        onSave={this.onSave}
        activeFlowJob={activeFlowJob}
        type={type}
      />
    );
  }

  render() {
    const { activeFlowJob, currentTab } = this.state;

    return (
      <>
        <Description>
          <h4>
            {activeFlowJob.type}: {activeFlowJob.label}
          </h4>
          <p>{activeFlowJob.description}</p>
        </Description>
        <FlowJobTabs>
          <Tabs full={true}>
            <TabTitle
              className={currentTab === 'content' ? 'active' : ''}
              onClick={this.tabOnClick.bind(this, 'content')}
            >
              {__('Job Config')}
            </TabTitle>
            <TabTitle
              className={currentTab === 'status' ? 'active' : ''}
              onClick={this.tabOnClick.bind(this, 'status')}
            >
              {__('Status')}
            </TabTitle>
          </Tabs>
        </FlowJobTabs>
        <ScrolledContent>{this.renderContent()}</ScrolledContent>
      </>
    );
  }
}

export default JobDetailForm;
