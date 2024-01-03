import { Description, FlowJobTabs, ScrolledContent } from '../../../styles';
import { TabTitle, Tabs } from '@erxes/ui/src/components/tabs';

import { ActionForms } from '.';
import { IJob } from 'flow/types';
import JobStatus from '../../../containers/forms/jobs/FlowJobStatus';
import React from 'react';
import { __ } from 'coreui/utils';

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
          <div>
            <h4>
              {activeFlowJob.type}: {activeFlowJob.label}
            </h4>
            <p>{activeFlowJob.description}</p>
          </div>
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
