import { __ } from 'coreui/utils';
import React from 'react';

import { ControlLabel } from '@erxes/ui/src/components/form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Info from '@erxes/ui/src/components/Info';
import Label from '@erxes/ui/src/components/Label';
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

  renderProducts = (products, type) => {
    const style = type === 'need' ? 'simple' : 'default';
    const space = '\u00a0\u00a0\u00a0\u00a0';

    return products.map(product => {
      return (
        <>
          <FormGroup>
            <ControlLabel key={product.id}>
              {space}
              {product.product.name} <Label lblStyle={style}>{type}</Label>
            </ControlLabel>
          </FormGroup>
        </>
      );
    });
  };

  renderActions = (chosenActions: IJob[], jobRefers, type) => {
    return chosenActions.map(action => {
      const jobRefer = jobRefers.find(job => job._id === action.jobReferId);
      const needProducts = jobRefer.needProducts || [];
      const resultProducts = jobRefer.resultProducts || [];

      console.log('jobRefer: ', jobRefer, needProducts, resultProducts);

      return (
        <>
          <FormGroup>
            <ControlLabel key={action.id}>{action.label}</ControlLabel>
          </FormGroup>

          {type === 'next' && this.renderProducts(needProducts, 'need')}
          {type === 'prev' && this.renderProducts(resultProducts, 'result')}
          {type === 'cur' && this.renderProducts(resultProducts, 'need')}
          {type === 'cur' && this.renderProducts(resultProducts, 'result')}
        </>
      );
    });
  };

  renderContent() {
    const { jobRefers, actions, activeAction } = this.props;
    const beforeActions = actions.filter(e =>
      e.nextJobIds.includes(activeAction.id)
    );

    const afterActions = actions.filter(
      e => e.id === activeAction.nextJobIds[0]
    );

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

        <FormWrapper>
          <FormColumn>
            <Info type="info" title="Previous">
              {this.renderActions(beforeActions, jobRefers, 'prev')}
            </Info>
          </FormColumn>

          <FormColumn>
            <Info type="success" title="Current">
              {this.renderActions([activeAction], jobRefers, 'cur')}
            </Info>
          </FormColumn>

          <FormColumn>
            <Info type="info" title="Next">
              {this.renderActions(afterActions, jobRefers, 'next')}
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
