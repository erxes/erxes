import { CloseIcon, Description, ScrolledContent } from '../../../styles';
import { FLOWJOBS, FLOWJOB_TYPES } from '../../../constants';

import { FlowJobBox } from './styles';
import { IJob } from '../../../types';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from 'coreui/utils';

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
        <Description>
          <div>
            <h4>{__('Choose your flow type')}</h4>
            <p>{__('Start with a flow type that enrolls your job')}</p>
          </div>

          <CloseIcon
            onClick={() => {
              this.props.setMainState({
                usedPopup: false,
                showDrawer: false
              });
            }}
          >
            <Tip text={__('Close')} placement="bottom">
              <Icon icon="cancel" size={18} />
            </Tip>
          </CloseIcon>
        </Description>
        <ScrolledContent>{this.renderContent()}</ScrolledContent>
      </>
    );
  }
}

export default FlowJobsForm;
