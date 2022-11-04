import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import { FLOWJOB_TYPES, FLOWJOBS } from '../../../constants';
import { FlowJobBox } from './styles';
import { IJob } from '../../../types';
import { ScrolledContent, CloseIcon } from '../../../styles';

type Props = {
  flowJobsOfEnd?: IJob;
  isSub?: boolean;
  onClickFlowJob: (flowJob: IJob) => void;
  setMainState: (param: any) => void;
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

  renderBox(flowJob, index) {
    const { flowJobsOfEnd, isSub, onClickFlowJob } = this.props;
    if (flowJobsOfEnd && flowJob.type === FLOWJOB_TYPES.ENDPOINT) {
      return <></>;
    }

    if (isSub && flowJob.type === FLOWJOB_TYPES.FLOW) {
      return <></>;
    }

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
        <CloseIcon
          onClick={() => {
            this.props.setMainState({
              usedPopup: false,
              showDrawer: false
            });
          }}
        >
          {__('Close')}
          <Icon icon="angle-double-right" size={20} />
        </CloseIcon>
        <ScrolledContent>{this.renderContent()}</ScrolledContent>
      </>
    );
  }
}

export default FlowJobsForm;
