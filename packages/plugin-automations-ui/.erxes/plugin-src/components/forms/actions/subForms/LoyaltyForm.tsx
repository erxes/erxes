import React from 'react';
import Select from 'react-select-plus';
import { __, ControlLabel, FormGroup } from '@erxes/ui/src';
import { IVoucherCampaign } from '@erxes/plugin-loyalties-ui/src/configs/voucherCampaign/types';
import styled from 'styled-components';
import { dimensions, colors } from '@erxes/ui/src/styles';
import Common from '../Common';

export const DrawerDetail = styled.div`
  padding: ${dimensions.coreSpacing}px;
  border: 1px solid ${colors.borderPrimary};
  border-radius: 5px;
`;

type Props = {
  closeModal: () => void;
  activeAction: any;
  triggerType: string;
  addAction: (action: any, actionId?: string, config?: any) => void;
  voucherCampaigns: IVoucherCampaign[];
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
      config: fillConfig,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeAction !== this.props.activeAction) {
      this.setState({ config: nextProps.activeAction.config });
    }
  }

  onChangeField = option => {
    const { config } = this.state;
    config.voucherCampaignId = option.value;

    this.setState({ config });
  };

  renderContent() {
    return (
      <DrawerDetail>
        <FormGroup>
          <ControlLabel>Voucher Campaign</ControlLabel>
          <Select
            isRequired={true}
            value={this.state.config.voucherCampaignId}
            options={this.props.voucherCampaigns.map(v => ({
              label: v.title,
              value: v._id
            }))}
            onChange={this.onChangeField}
            placeholder={__('Choose type')}
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
