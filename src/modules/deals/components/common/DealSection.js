import React from 'react';
import PropTypes from 'prop-types';
import { ModalTrigger, EmptyState, Icon } from 'modules/common/components';
import { Deal } from '../../containers';
import { DealAddForm } from '../';
import { SectionContainer } from '../../styles/deal';
import { BaseSection } from 'modules/common/components';

const propTypes = {
  deals: PropTypes.array,
  customerId: PropTypes.string,
  companyId: PropTypes.string,
  saveDeal: PropTypes.func,
  removeDeal: PropTypes.func
};

const defaultProps = {
  deals: []
};

class DealSection extends React.Component {
  renderDeals() {
    const { saveDeal, removeDeal, deals } = this.props;

    if (deals.length === 0) {
      return <EmptyState icon="piggy-bank" text="No deal" />;
    }

    return deals.map((deal, index) => (
      <Deal
        key={index}
        dealId={deal._id}
        saveDeal={saveDeal}
        removeDeal={removeDeal}
      />
    ));
  }

  render() {
    const { saveDeal, customerId, companyId } = this.props;
    const { __ } = this.context;

    const trigger = (
      <a>
        <Icon icon="add" />
      </a>
    );

    const quickButtons = (
      <ModalTrigger title="Add a deal" trigger={trigger}>
        <DealAddForm
          saveDeal={saveDeal}
          customerId={customerId}
          companyId={companyId}
          showSelect
        />
      </ModalTrigger>
    );

    const content = <SectionContainer>{this.renderDeals()}</SectionContainer>;

    return (
      <BaseSection
        title={__('Deals')}
        quickButtons={quickButtons}
        content={content}
        isUseCustomer={true}
      />
    );
  }
}

DealSection.propTypes = propTypes;
DealSection.contextTypes = {
  __: PropTypes.func
};
DealSection.defaultProps = defaultProps;

export default DealSection;
