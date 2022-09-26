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
};

type State = {
  jobReferId: string;
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

    const { config, description } = props.activeFlowJob;

    const {
      jobReferId,
      inBranchId,
      inDepartmentId,
      outBranchId,
      outDepartmentId
    } = config;

    this.state = {
      jobReferId: jobReferId || '',
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
      this.setState({ jobReferId: nextProps.activeFlowJob.jobReferId });
    }
  }

  renderJobTrigger(job?: IJobRefer) {
    let content = (
      <div>
        {__('Choose Job')} <Icon icon="plus-circle" />
      </div>
    );

    // if product selected
    if (job) {
      content = (
        <div>
          {job.name} <Icon icon="pen-1" />
        </div>
      );
    }

    return <ProductButton>{content}</ProductButton>;
  }

  renderContent() {
    const { jobRefers } = this.props;

    const onChangeValue = (type, e) => {
      this.setState({ [type]: e.target.value } as any);
    };

    const { description } = this.state;

    const content = props => (
      <JobReferChooser
        {...props}
        onSelect={pr => console.log(pr)}
        onChangeCategory={categoryId => this.setState({ categoryId })}
        categoryId={this.state.categoryId}
        data={{
          name: 'Jobs',
          jobRefers
        }}
        limit={1}
      />
    );

    return (
      <DrawerDetail>
        <FormGroup>
          <ControlLabel>Jobs</ControlLabel>
          <ModalTrigger
            title="Choose a JOB"
            trigger={this.renderJobTrigger(
              jobRefers.length ? jobRefers[0] : undefined
            )}
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
      description,
      inBranchId,
      inDepartmentId,
      outBranchId,
      outDepartmentId
    } = this.state;

    return (
      <Common
        description={description}
        config={{
          jobReferId,
          inBranchId,
          inDepartmentId,
          outBranchId,
          outDepartmentId
        }}
        {...this.props}
      >
        {this.renderContent()}
      </Common>
    );
  }
}

export default JobForm;
