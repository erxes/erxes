import React from 'react';
import Common from '../Common';
import { DrawerDetail } from '../../../../styles';
import { __ } from 'coreui/utils';
import { ControlLabel } from '@erxes/ui/src/components/form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IJob } from '../../../../../flow/types';
import { IJobRefer } from '../../../../../job/types';

import FormControl from '@erxes/ui/src/components/form/Control';

type Props = {
  closeModal: () => void;
  onSave: () => void;
  activeAction: IJob;
  triggerType: string;
  jobRefers: IJobRefer[];
  addAction: (action: IJob, actionId?: string, jobReferId?: string) => void;
};

type State = {
  jobReferId: string;
  description: string;
};

class Delay extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    console.log('this.props.activeAction', this.props.activeAction);
    const { id, description } = this.props.activeAction;

    this.state = { jobReferId: id || '', description: description || '' };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeAction !== this.props.activeAction) {
      this.setState({ jobReferId: nextProps.activeAction.jobReferId });
    }
  }

  onChangeField = (value: string) => {
    this.setState({ jobReferId: value });
  };

  renderContent() {
    const { jobRefers } = this.props;
    console.log('jobRefers on customCode:', jobRefers);

    const onChangeValue = (type, e) => {
      this.setState({ [type]: e.target.value });
    };

    return (
      <DrawerDetail>
        <FormGroup>
          <ControlLabel>Job</ControlLabel>
          <FormControl
            name="type"
            componentClass="select"
            onChange={onChangeValue.bind(this, 'jobReferId')}
            required={true}
            value={this.state.jobReferId}
          >
            <option value="" />
            {jobRefers.map(jobRefer => (
              <option key={jobRefer._id} value={jobRefer._id}>
                {jobRefer.name}
              </option>
            ))}
          </FormControl>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            name="description"
            value={this.state.description}
            onChange={onChangeValue.bind(this, 'description')}
          />
        </FormGroup>
      </DrawerDetail>
    );
  }

  render() {
    const { jobReferId, description } = this.state;

    return (
      <Common jobReferId={jobReferId} description={description} {...this.props}>
        {this.renderContent()}
      </Common>
    );
  }
}

export default Delay;
