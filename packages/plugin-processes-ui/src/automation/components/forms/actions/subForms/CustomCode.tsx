import React from 'react';
import Common from '../Common';
import { DrawerDetail } from '../../../../styles';
import { __ } from 'coreui/utils';
import { ControlLabel } from '@erxes/ui/src/components/form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IJob } from '../../../../../flow/types';
import { IJobRefer } from '../../../../../job/types';

import { FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';

import FormControl from '@erxes/ui/src/components/form/Control';

type Props = {
  closeModal: () => void;
  onSave: () => void;
  activeAction?: IJob;
  jobRefers: IJobRefer[];
  actions: IJob[];
  addAction: (action: IJob, actionId?: string, jobReferId?: string) => void;
};

type State = {
  jobReferId: string;
  description: string;
};

class Delay extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { jobReferId, description } = this.props.activeAction;

    this.state = {
      jobReferId: jobReferId ? jobReferId : '',
      description: description ? description : ''
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeAction !== this.props.activeAction) {
      this.setState({ jobReferId: nextProps.activeAction.jobReferId });
    }
  }

  renderContent() {
    const { jobRefers, actions, activeAction } = this.props;
    // console.log('actions on customCode:', actions);
    // console.log('jobRefers on customCode:', jobRefers);
    // console.log('this.props.activeAction', activeAction);

    const beforeActions = actions.filter(e =>
      e.nextJobIds.includes(activeAction.id)
    );

    const afterActions = actions.filter(
      e => e.id === activeAction.nextJobIds[0]
    );

    const onChangeValue = (type, e) => {
      this.setState({ [type]: e.target.value });
    };

    const renderActions = chosenActions => {
      return chosenActions.map(e => {
        return (
          <>
            <FormGroup>
              <ControlLabel key={e.id}>{e.label}</ControlLabel>
            </FormGroup>
          </>
        );
      });
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

        <FormWrapper>
          <FormColumn>
            <ControlLabel>Before jobs</ControlLabel>
            {renderActions(beforeActions)}
          </FormColumn>
          <FormColumn>
            <ControlLabel>Next jobs</ControlLabel>
            {renderActions(afterActions)}
          </FormColumn>
        </FormWrapper>
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
