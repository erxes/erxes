import Common from '../Common';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Icon from '@erxes/ui/src/components/Icon';
import JobReferChooser from '../../../../../job/containers/refer/Chooser';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import { Alert, __ } from '@erxes/ui/src/utils';
import { ControlLabel } from '@erxes/ui/src/components/form';
import { IJob } from '../../../../types';
import { IJobRefer } from '../../../../../job/types';
import { IProduct } from '@erxes/ui-products/src/types';
import { ProductButton } from '@erxes/ui-cards/src/deals/styles';

type Props = {
  closeModal: () => void;
  activeFlowJob: IJob;
  jobRefer?: IJobRefer;
  flowJobs: IJob[];
  lastFlowJob?: IJob;
  flowProduct?: IProduct;
  addFlowJob: (job: IJob, id?: string, config?: any) => void;
  setUsedPopup: (check: boolean) => void;
  setMainState: (param: any) => void;
};

type State = {
  jobReferId: string;
  jobRefer?: IJobRefer;
  description: string;
  currentTab: string;
  categoryId: string;
};

class JobForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { jobRefer, activeFlowJob } = props;
    const { config, description } = activeFlowJob;

    const { jobReferId } = config;

    this.state = {
      jobReferId: jobReferId || '',
      jobRefer,
      description: description || '',
      currentTab: 'inputs',

      categoryId: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeFlowJob !== this.props.activeFlowJob) {
      this.setState({
        description: nextProps.activeFlowJob.description,
        jobReferId: nextProps.activeFlowJob.jobReferId,
        jobRefer: nextProps.jobRefer
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
          {job.code} - {job.name} <Icon icon="pen-1" />
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

    const onChangeJob = jobRefers => {
      let selected: any;
      if (!jobRefers.length) {
        this.setState({ jobReferId: '', jobRefer: undefined }, () => {
          this.props.setMainState({
            product: undefined,
            productId: ''
          });
        });
        return;
      }

      selected = jobRefers[0];
      this.setState({ jobReferId: selected._id, jobRefer: selected }, () => {
        if (!selected.resultProducts.length) {
          return Alert.error('This endPoint job has not result products');
        }

        const endProduct = selected.resultProducts[0].product || {};
        this.props.setMainState({
          product: endProduct,
          productId: endProduct._id
        });
      });
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
      <>
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
      </>
    );
  }

  render() {
    const { jobReferId, jobRefer, description } = this.state;

    return (
      <Common
        {...this.props}
        name={(jobRefer && jobRefer.name) || 'Unknown'}
        description={description}
        jobRefer={jobRefer}
        config={{ jobReferId }}
      >
        {this.renderContent()}
      </Common>
    );
  }
}

export default JobForm;
