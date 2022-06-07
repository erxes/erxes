import { __ } from 'coreui/utils';
import React from 'react';

import { EmptyContent } from '@erxes/ui/src/activityLogs/styles';
import { ControlLabel } from '@erxes/ui/src/components/form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Info from '@erxes/ui/src/components/Info';
import { FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';

import { IJob } from '../../../../../flow/types';
import { IJobRefer } from '../../../../../job/types';
import { DrawerDetail } from '../../../../styles';
import Common from '../Common';

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
            <Info type="info" title="Before jobs">
              {renderActions(beforeActions)}
            </Info>
          </FormColumn>
          <FormColumn>
            <Info type="info" title="Next jobs">
              {renderActions(afterActions)}
            </Info>
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
