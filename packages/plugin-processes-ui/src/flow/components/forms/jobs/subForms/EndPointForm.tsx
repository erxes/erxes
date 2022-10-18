import Common from '../Common';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Icon from '@erxes/ui/src/components/Icon';
import JobReferChooser from '../../../../../job/containers/refer/Chooser';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import { ControlLabel } from '@erxes/ui/src/components/form';
import { DrawerDetail } from '../../../../styles';
import { IJob } from '../../../../types';
import { IJobRefer } from '../../../../../job/types';
import { IProduct } from '@erxes/ui-products/src/types';
import { ProductButton } from '@erxes/ui-cards/src/deals/styles';

type Props = {
  closeModal: () => void;
  activeFlowJob: IJob;
  jobRefers: IJobRefer[];
  flowJobs: IJob[];
  lastFlowJob?: IJob;
  flowProduct?: IProduct;
  addFlowJob: (job: IJob, id?: string, config?: any) => void;
  setUsedPopup: (check: boolean) => void;
};

type State = {
  jobReferId: string;
  jobRefer?: IJobRefer;
  description: string;
  inBranchId: string;
  inDepartmentId: string;
  outBranchId: string;
  outDepartmentId: string;
  currentTab: string;
  categoryId: string;
};

class JobForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { jobRefers, activeFlowJob } = props;
    const { config, description } = activeFlowJob;

    const jobRefer = jobRefers.length && jobRefers[0];

    const {
      jobReferId,
      inBranchId,
      inDepartmentId,
      outBranchId,
      outDepartmentId
    } = config;

    this.state = {
      jobReferId: jobReferId || '',
      jobRefer,
      description: description || '',
      inBranchId: inBranchId || '',
      inDepartmentId: inDepartmentId || '',
      outBranchId: outBranchId || '',
      outDepartmentId: outDepartmentId || '',
      currentTab: 'inputs',

      categoryId: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeFlowJob !== this.props.activeFlowJob) {
      this.setState({
        jobReferId: nextProps.activeFlowJob.jobReferId,
        description: nextProps.activeFlowJob.description
      });
    }
  }

  renderJobTrigger(job?: IJobRefer) {
    const onClick = () => {
      this.props.setUsedPopup(true);
    };

    let content = (
      <div onClick={onClick}>
        {__('Choose Job')} <Icon icon="plus-circle" />
      </div>
    );

    if (job) {
      content = (
        <div onClick={onClick}>
          {job.name} <Icon icon="pen-1" />
        </div>
      );
    }

    return <ProductButton>{content}</ProductButton>;
  }

  renderContent() {
    const { jobRefer, description } = this.state;

    const onChangeValue = (type, e) => {
      this.setState({ [type]: e.target.value } as any);
    };

    const onChangeJob = prs => {
      let pr: any;
      if (!prs.length) {
        this.setState({ jobReferId: '', jobRefer: undefined });
        return;
      }

      pr = prs[0];
      this.setState({ jobReferId: pr._id, jobRefer: pr });
    };

    const content = props => {
      const onCloseModal = () => {
        this.props.setUsedPopup(false);
        props.closeModal();
      };

      return (
        <JobReferChooser
          {...props}
          closeModal={onCloseModal}
          onSelect={onChangeJob}
          onChangeCategory={categoryId => this.setState({ categoryId })}
          types={['end']}
          categoryId={this.state.categoryId}
          data={{
            name: 'Jobs',
            jobRefers: jobRefer ? [jobRefer] : []
          }}
          limit={1}
        />
      );
    };

    return (
      <DrawerDetail>
        <FormGroup>
          <ControlLabel>Jobs</ControlLabel>
          <ModalTrigger
            title="Choose a JOB"
            trigger={this.renderJobTrigger(jobRefer)}
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
      </DrawerDetail>
    );
  }

  render() {
    const {
      jobReferId,
      jobRefer,
      description,
      inBranchId,
      inDepartmentId,
      outBranchId,
      outDepartmentId
    } = this.state;

    return (
      <Common
        {...this.props}
        name={(jobRefer && jobRefer.name) || 'Unknown'}
        description={description}
        config={{
          jobReferId,
          inBranchId,
          inDepartmentId,
          outBranchId,
          outDepartmentId
        }}
      >
        {this.renderContent()}
      </Common>
    );
  }
}

export default JobForm;
