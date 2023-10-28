import Common from '../Common';
import { ProductButton } from '@erxes/ui-cards/src/deals/styles';
import FormControl from '@erxes/ui/src/components/form/Control';
import FlowChooser from '../../../../containers/flow/Chooser';
import FormGroup from '@erxes/ui/src/components/form/Group';
import React from 'react';
import { __ } from 'coreui/utils';
import { ControlLabel } from '@erxes/ui/src/components/form';
import { IJob, IFlow } from '../../../../types';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Icon from '@erxes/ui/src/components/Icon';

type Props = {
  closeModal: () => void;
  activeFlowJob: IJob;
  subFlow?: IFlow;
  flowJobs: IJob[];
  addFlowJob: (job: IJob, id?: string, config?: any) => void;
  setUsedPopup: (check: boolean) => void;
};

type State = {
  subFlowId: string;
  subFlow?: IFlow;
  description: string;
  currentTab: string;
  categoryId: string;
};

class JobForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { subFlow, activeFlowJob } = props;
    const { config, description } = activeFlowJob;

    const { subFlowId } = config;

    this.state = {
      subFlowId: subFlowId || '',
      subFlow,
      description: description || '',
      currentTab: 'inputs',

      categoryId: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeFlowJob !== this.props.activeFlowJob) {
      this.setState({
        description: nextProps.activeFlowJob.description,
        subFlowId: nextProps.activeFlowJob.subFlowId,
        subFlow: nextProps.subFlow
      });
    }
  }

  onSelect = (name, value) => {
    this.setState({ [name]: value } as any);
  };

  renderSubFlowTrigger(flow?: IFlow) {
    const onClick = () => {
      this.props.setUsedPopup(true);
    };

    let content = (
      <div onClick={onClick}>
        {__('Choose Sub Flow')} <Icon icon="plus-circle" />
      </div>
    );

    if (flow) {
      content = (
        <div onClick={onClick}>
          {flow.name} <Icon icon="pen-1" />
        </div>
      );
    }

    return <ProductButton>{content}</ProductButton>;
  }

  renderContent() {
    const { subFlow, description } = this.state;

    const onChangeValue = (type, e) => {
      this.setState({ [type]: e.target.value } as any);
    };

    const onChangeJob = prs => {
      let pr: any;
      if (!prs.length) {
        this.setState({ subFlowId: '', subFlow: undefined });
        return;
      }

      pr = prs[0];
      this.setState({ subFlowId: pr._id, subFlow: pr });
    };

    const content = props => {
      const onCloseModal = () => {
        this.props.setUsedPopup(false);
        props.closeModal();
      };

      return (
        <FlowChooser
          {...props}
          closeModal={onCloseModal}
          onSelect={onChangeJob}
          onChangeCategory={categoryId => this.setState({ categoryId })}
          categoryId={this.state.categoryId}
          data={{
            name: 'Flows',
            flows: subFlow ? [subFlow] : []
          }}
          isSub={true}
          limit={1}
        />
      );
    };

    return (
      <>
        <FormGroup>
          <ControlLabel>Sub Flows</ControlLabel>
          <ModalTrigger
            title="Choose a FLOW"
            trigger={this.renderSubFlowTrigger(subFlow)}
            size="lg"
            content={content}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            name="description"
            value={description}
            onChange={onChangeValue.bind(this, 'description')}
          />
        </FormGroup>
      </>
    );
  }

  render() {
    const { subFlowId, subFlow, description } = this.state;

    return (
      <Common
        {...this.props}
        name={(subFlow && `${subFlow.name}`) || 'Unknown'}
        description={description}
        config={{ subFlowId }}
      >
        {this.renderContent()}
      </Common>
    );
  }
}

export default JobForm;
