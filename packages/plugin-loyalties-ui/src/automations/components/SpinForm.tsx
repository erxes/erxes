import React from 'react';
import { __, ControlLabel, FormGroup } from '@erxes/ui/src';
import Common from '@erxes/ui-automations/src/components/forms/actions/Common';
import { DrawerDetail } from '@erxes/ui-automations/src/styles';
import SelectSpinCampaign from '../../common/SelectSpin';

type Props = {
  closeModal: () => void;
  activeAction: any;
  triggerType: string;
  addAction: (action: any, actionId?: string, config?: any) => void;
  common: any;
};

type State = {
  config: any;
};

class LoyaltyForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { config } = this.props.activeAction;
    const fillConfig = config || {};

    this.state = {
      config: fillConfig
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeAction !== this.props.activeAction) {
      this.setState({ config: nextProps.activeAction.config });
    }
  }

  onSelect = (value, name) => {
    const { config } = this.state;

    this.setState({ config: { ...config, spinCampaignId: value } });
  };

  renderContent() {
    return (
      <DrawerDetail>
        <FormGroup>
          <ControlLabel>Spin Campaign</ControlLabel>
          <SelectSpinCampaign
            label="Spin campaign"
            name="spinCampaignId"
            onSelect={this.onSelect}
          />
        </FormGroup>
      </DrawerDetail>
    );
  }

  render() {
    return (
      <Common config={this.state.config} {...this.props}>
        {this.renderContent()}
      </Common>
    );
  }
}

export default LoyaltyForm;
