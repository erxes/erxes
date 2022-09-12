import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import { FlowJobBox } from './styles';
import { FLOWJOBS } from '../../../constants';
import { IJob } from '../../../types';
import { ScrolledContent } from '../../../styles';

type Props = {
  onClickFlowJob: (flowJob: IJob) => void;
};

type State = {
  currentTab: string;
  isFavourite: boolean;
};

class FlowJobsForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentTab: 'flowJobs',
      isFavourite: false
    };
  }

  tabOnClick = (currentTab: string) => {
    this.setState({ currentTab });
  };

  onFavourite = (flowJob, e) => {
    e.stopPropagation();

    this.setState({ isFavourite: !this.state.isFavourite });

    const flowJobsLocalStorage =
      localStorage.getItem('automations_favourite_flowJobs') || '[]';

    let flowJobs = JSON.parse(flowJobsLocalStorage);

    if (flowJobs.find(item => item.type === flowJob.type)) {
      flowJobs = flowJobs.filter(item => item.type !== flowJob.type);
    } else {
      flowJobs.push(flowJob);
    }

    localStorage.setItem(
      'automations_favourite_flowJobs',
      JSON.stringify(flowJobs)
    );
  };

  renderBox(flowJob, index) {
    const { onClickFlowJob } = this.props;

    return (
      <FlowJobBox
        key={index}
        onClick={onClickFlowJob.bind(this, { ...flowJob, config: {} })}
        isAvailable={flowJob.isAvailable}
      >
        <Icon icon={flowJob.icon} size={30} />
        <div>
          <b>{__(flowJob.label)}</b>
          {!flowJob.isAvailable && <span>{__('Coming soon')}</span>}
          <p>{__(flowJob.description)}</p>
        </div>
      </FlowJobBox>
    );
  }

  renderContent() {
    const flowJobs = FLOWJOBS;

    return flowJobs.map((flowJob, index) => {
      return (
        <React.Fragment key={index}>
          {this.renderBox(flowJob, index)}
        </React.Fragment>
      );
    });
  }

  render() {
    return (
      <>
        <ScrolledContent>{this.renderContent()}</ScrolledContent>
      </>
    );
  }
}

export default FlowJobsForm;
