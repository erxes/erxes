import { Box, Icon } from '@erxes/ui/src/components';
import { __,  } from '@erxes/ui/src/utils';
import { SectionBodyItem } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';

import { LoyaltyAmount } from '../styles';
import { ICustomerLoyalty } from '../types';

type IProps = {
  customerId?: string;
  customerLoyalty: ICustomerLoyalty;
};

class LoyaltySection extends React.Component<IProps, {}> {
  render() {
    const { customerLoyalty, customerId } = this.props;
    return (
      <Box
        title={__('Loyalty')}
        name="showCars"
        isOpen={true}
      >
        <SectionBodyItem>
          <Link to={`/list/${customerId}`}>
            <Icon icon="star" />
            <LoyaltyAmount>{customerLoyalty.loyalty || '0.00'}</LoyaltyAmount>
          </Link>
        </SectionBodyItem>
      </Box>
    )
  }
}
export default LoyaltySection;
