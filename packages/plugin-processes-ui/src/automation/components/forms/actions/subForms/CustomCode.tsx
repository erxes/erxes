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
};

class Delay extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { jobReferId: '' };
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

    const onChangeValue = e => this.onChangeField(e.target.value);

    return (
      <DrawerDetail>
        <FormGroup>
          <ControlLabel>Jobs</ControlLabel>
          <FormControl
            name="type"
            componentClass="select"
            onChange={onChangeValue}
            required={true}
          >
            <option value="" />
            {jobRefers.map(jobRefer => (
              <option key={jobRefer._id} value={jobRefer._id}>
                {jobRefer.name}
              </option>
            ))}
          </FormControl>
        </FormGroup>
      </DrawerDetail>
    );
  }

  render() {
    return (
      <Common jobReferId={this.state.jobReferId} {...this.props}>
        {this.renderContent()}
      </Common>
    );
  }
}

export default Delay;
