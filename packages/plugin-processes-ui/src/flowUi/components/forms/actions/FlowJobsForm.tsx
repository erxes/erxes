import React from 'react';

import EmptyState from '@erxes/ui/src/components/EmptyState';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';

import { IJob } from '../../../../flow/types';
import { FLOWJOBS } from '../../../constants';
import { ScrolledContent } from '../../../styles';
import { FlowJobBox } from './styles';
import { __ } from '@erxes/ui/src/utils';

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

  renderBox(flowJob, isFavourite, index) {
    const { onClickFlowJob } = this.props;

    return (
      <FlowJobBox
        key={index}
        onClick={onClickFlowJob.bind(this, flowJob)}
        isFavourite={isFavourite}
        isAvailable={flowJob.isAvailable}
      >
        <Icon icon={flowJob.icon} size={30} />
        <div>
          <b>{__(flowJob.label)}</b>
          {!flowJob.isAvailable && <span>{__('Coming soon')}</span>}
          <p>{__(flowJob.description)}</p>
        </div>
        <Tip
          text={isFavourite ? __('Unfavourite') : __('Favourite')}
          placement="top"
        >
          <div
            className="favourite-flowJob"
            onClick={this.onFavourite.bind(this, flowJob)}
          >
            <Icon icon="star" size={20} />
          </div>
        </Tip>
      </FlowJobBox>
    );
  }

  renderContent() {
    const localStorageFlowJobs = JSON.parse(
      localStorage.getItem('automations_favourite_flowJobs') || '[]'
    );

    const flowJobs =
      this.state.currentTab === 'favourite' ? localStorageFlowJobs : FLOWJOBS;

    if (flowJobs.length === 0 && localStorageFlowJobs.length === 0) {
      return (
        <EmptyState
          image="/images/actions/8.svg"
          text="Add your favourite flowJobs"
          size="small"
        />
      );
    }

    return flowJobs.map((flowJob, index) => {
      const isFavourite = localStorageFlowJobs.some(
        item => item.type === flowJob.type
      );

      return (
        <React.Fragment key={index}>
          {this.renderBox(flowJob, isFavourite, index)}
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
