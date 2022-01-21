import { __, Box, Icon, SectionBodyItem } from 'erxes-ui';
import React from 'react';
import { Link } from 'react-router-dom';

import { LoyaltyAmount } from '../../styles';
import { FlexItem } from '../common/styles';
import { IVoucher } from '../vouchers/types';

type IProps = {
  ownerId?: string;
  ownerType?: string;
  vouchers: IVoucher[];
};

class LoyaltySection extends React.Component<IProps, {}> {
  renderVoucher(voucher: IVoucher) {
    return (
      <LoyaltyAmount key={voucher._id}>
        {voucher.compaignId}
      </LoyaltyAmount>
    )
  }

  render() {
    const { ownerId, ownerType, vouchers } = this.props;

    return (
      <Box
        title={__('Loyalty')}
        name="Vouchers"
        isOpen={true}
      >
        <SectionBodyItem>
          <Link to={`/erxes-plugin-loyalty/vouchers?ownerId=${ownerId}&ownerType=${ownerType}`}>
            <Icon icon="star" />
            {`Vouchers`}
          </Link>
          {(vouchers || []).map(v => (this.renderVoucher(v)))}
        </SectionBodyItem>
      </Box>
    )
  }
}
export default LoyaltySection;
