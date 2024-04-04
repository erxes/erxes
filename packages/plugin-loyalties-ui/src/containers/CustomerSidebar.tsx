import React from 'react';
import LoyaltySectionContainer from '../loyalties/containers/LoyaltySection';

type Props = {
  id: string;
};

class CustomerSection extends React.Component<Props> {
  render() {
    return (
      <LoyaltySectionContainer ownerId={this.props.id} ownerType="customer" />
    );
  }
}

export default CustomerSection;
