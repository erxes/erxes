import React from 'react';
import Select from 'react-select-plus';
import { __, ControlLabel, FormGroup } from 'erxes-ui';
import { IVoucherCompaign } from '../../configs/voucherCompaign/types';
import styled from 'styled-components';
import dimensions from 'erxes-ui/lib/styles/dimensions';
import colors from 'erxes-ui/lib/styles/colors';

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
  voucherCompaigns: IVoucherCompaign[];
  common: any;
};

type State = {
  config: any;
};

class SetVoucher extends React.Component<Props, State> {
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
    config.voucherCompaignId = option.value;

    this.setState({ config });
  };

  renderContent() {
    return (
      <DrawerDetail>
        <FormGroup>
          <ControlLabel>Voucher Compaign</ControlLabel>
          <Select
            isRequired={true}
            value={this.state.config.voucherCompaignId}
            options={this.props.voucherCompaigns.map(v => ({
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
    const Common = this.props.common;
    return (
      <Common config={this.state.config} {...this.props}>
        {this.renderContent()}
      </Common>
    );
  }
}

export default SetVoucher;
